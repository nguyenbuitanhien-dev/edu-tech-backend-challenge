import { prisma } from '../../config/prisma';
import { PaymentService } from './payment.service';
import { EnrollmentStatus } from '../../constants/status';

export class EnrollmentService {
  static async createEnrollment(studentId: string, classId: string) {
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: { course: true },
    });

    if (!targetClass) {
      throw new Error('Lớp học không tồn tại.');
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        classId,
      },
    });

    if (existingEnrollment) {
      throw new Error('Học viên đã đăng ký lớp học này từ trước.');
    }

    const currentEnrolledCount = await prisma.enrollment.count({
      where: { classId },
    });

    if (currentEnrolledCount >= targetClass.capacity) {
      throw new Error('Lớp học đã đạt sĩ số tối đa.');
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        classId,
        status: EnrollmentStatus.REGISTERED,
        accessLocked: false,
      },
    });

    await PaymentService.generatePaymentsForEnrollment(
      enrollment.id,
      targetClass.course.paymentType,
      targetClass.startDate
    );

    return prisma.enrollment.findUnique({
      where: { id: enrollment.id },
      include: {
        class: { include: { course: true } },
        payments: { orderBy: { dueDate: 'asc' } },
      },
    });
  }

  static async updateStatus(enrollmentId: string, status: EnrollmentStatus) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new Error('Đăng ký không tồn tại.');
    }

    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        class: { select: { id: true, classCode: true } },
        payments: true,
      },
    });
  }

  static async getStudentEnrollments(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            course: true,
            teacher: { select: { id: true, fullName: true, email: true } },
            staff: { select: { id: true, fullName: true, email: true } },
            sessions: { orderBy: { sessionDate: 'asc' } },
          },
        },
        payments: { orderBy: { dueDate: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map((enr) => {
      const isLocked = enr.accessLocked;
      return {
        ...enr,
        class: {
          ...enr.class,
          googleMeetLink: isLocked ? null : enr.class.googleMeetLink,
        },
        accessNotice: isLocked
          ? 'Link học Google Meet bị ẩn do có đợt học phí quá hạn chưa thanh toán.'
          : 'Link học khả dụng.',
      };
    });
  }
}
