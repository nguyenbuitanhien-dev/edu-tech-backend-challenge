import dayjs from 'dayjs';
import { prisma } from '../../config/prisma';
import { PaymentStatus } from '../../constants/status';

export class PaymentService {
  static async generatePaymentsForEnrollment(
    enrollmentId: string,
    paymentType: string,
    classStartDate: string
  ) {
    const startDay = dayjs(classStartDate, 'YYYY-MM-DD');

    if (paymentType === 'FULL_COURSE') {
      await prisma.payment.create({
        data: {
          enrollmentId,
          amount: 3000000,
          dueDate: startDay.add(7, 'day').format('YYYY-MM-DD'),
          status: PaymentStatus.PENDING,
          monthIndex: null,
        },
      });
    } else {
      const monthlyAmount = 1000000;

      const paymentRecords = [1, 2, 3].map((monthIndex) => {
        const dueDate =
          monthIndex === 1
            ? startDay.add(7, 'day').format('YYYY-MM-DD')
            : startDay.add(monthIndex - 1, 'month').date(5).format('YYYY-MM-DD');

        return {
          enrollmentId,
          amount: monthlyAmount,
          dueDate,
          status: PaymentStatus.PENDING,
          monthIndex,
        };
      });

      await prisma.payment.createMany({
        data: paymentRecords,
      });
    }
  }

  static async payPayment(paymentId: string, paidDateStr?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { enrollment: true },
    });

    if (!payment) {
      throw new Error('Hóa đơn không tồn tại.');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new Error('Hóa đơn này đã được thanh toán trước đó.');
    }

    const paidDate = paidDateStr || dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PAID,
        paidDate,
      },
    });

    const remainingOverdueCount = await prisma.payment.count({
      where: {
        enrollmentId: payment.enrollmentId,
        status: PaymentStatus.OVERDUE,
      },
    });

    if (remainingOverdueCount === 0 && payment.enrollment.accessLocked) {
      await prisma.enrollment.update({
        where: { id: payment.enrollmentId },
        data: { accessLocked: false },
      });
    }

    return updatedPayment;
  }

  static async checkAndUpdateOverduePayments() {
    const todayStr = dayjs().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

    const overduePayments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        dueDate: { lt: todayStr },
      },
    });

    if (overduePayments.length === 0) {
      return { updatedPaymentsCount: 0, lockedEnrollmentsCount: 0 };
    }

    const overdueIds = overduePayments.map((p) => p.id);
    const affectedEnrollmentIds = Array.from(new Set(overduePayments.map((p) => p.enrollmentId)));

    await prisma.payment.updateMany({
      where: { id: { in: overdueIds } },
      data: { status: PaymentStatus.OVERDUE },
    });

    await prisma.enrollment.updateMany({
      where: { id: { in: affectedEnrollmentIds } },
      data: { accessLocked: true },
    });

    return {
      updatedPaymentsCount: overdueIds.length,
      lockedEnrollmentsCount: affectedEnrollmentIds.length,
      lockedEnrollmentIds: affectedEnrollmentIds,
    };
  }
}
