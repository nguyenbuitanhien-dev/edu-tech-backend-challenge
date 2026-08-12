import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.serviceRequestLog.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.scheduleSession.deleteMany();
  await prisma.class.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const manager = await prisma.user.create({
    data: {
      fullName: 'Quản Lý Nguyễn Văn Q',
      email: 'manager@example.com',
      phone: '0901111111',
      passwordHash,
      role: 'MANAGER',
    },
  });

  const staff = await prisma.user.create({
    data: {
      fullName: 'Nhân Viên Trần Thị S',
      email: 'staff@example.com',
      phone: '0902222222',
      passwordHash,
      role: 'STAFF',
    },
  });

  const teacher = await prisma.user.create({
    data: {
      fullName: 'Thầy Lê Văn T',
      email: 'teacher@example.com',
      phone: '0903333333',
      passwordHash,
      role: 'TEACHER',
    },
  });

  const student = await prisma.user.create({
    data: {
      fullName: 'Học Viên Phạm Văn H',
      email: 'student@example.com',
      phone: '0904444444',
      passwordHash,
      role: 'STUDENT',
    },
  });

  const courseMonthly = await prisma.course.create({
    data: {
      courseCode: 'MATH12_MONTHLY',
      name: 'Toán 12 Phổ Thông (Đóng theo tháng)',
      description: 'Chương trình Toán 12 phổ thông đóng phí song song theo tháng',
      paymentType: 'MONTHLY',
      bookSet: 'Kết nối tri thức',
    },
  });

  const courseFull = await prisma.course.create({
    data: {
      courseCode: 'MATH12_FULL',
      name: 'Khóa Ôn Thi Cấp Tốc THPT Quốc Gia (Trọn khóa)',
      description: 'Luyện thi cấp tốc trọn gói 3 tháng',
      paymentType: 'FULL_COURSE',
      bookSet: 'Cánh Diều',
    },
  });

  const classMonthly = await prisma.class.create({
    data: {
      courseId: courseMonthly.id,
      classCode: 'MATH12_M26',
      teacherId: teacher.id,
      staffId: staff.id,
      capacity: 30,
      googleMeetLink: 'https://meet.google.com/sample-meet-link-2026',
      startDate: '2026-09-01',
      endDate: '2026-10-22',
      sessions: {
        create: [
          { sessionDate: '2026-09-01', startTime: '19:00', endTime: '21:00' },
          { sessionDate: '2026-09-03', startTime: '19:00', endTime: '21:00' },
          { sessionDate: '2026-09-08', startTime: '19:00', endTime: '21:00' },
        ],
      },
    },
  });

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      classId: classMonthly.id,
      status: 'REGISTERED',
      accessLocked: false,
      payments: {
        create: [
          {
            amount: 1000000,
            dueDate: '2026-09-08',
            status: 'PENDING',
            monthIndex: 1,
          },
          {
            amount: 1000000,
            dueDate: '2026-10-05',
            status: 'PENDING',
            monthIndex: 2,
          },
        ],
      },
    },
  });

  const serviceReq = await prisma.serviceRequest.create({
    data: {
      serviceName: 'Thiết kế Hệ thống Quản lý Khóa học LMS',
      contactInfo: 'Công ty EdTech Việt - Email: contact@edtech.vn - SĐT: 0912345678',
      status: 'IN_PROGRESS',
      staffId: staff.id,
      customerId: student.id,
      logs: {
        create: [
          {
            oldStatus: null,
            newStatus: 'NEW',
            changedById: staff.id,
          },
          {
            oldStatus: 'NEW',
            newStatus: 'IN_PROGRESS',
            changedById: staff.id,
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
