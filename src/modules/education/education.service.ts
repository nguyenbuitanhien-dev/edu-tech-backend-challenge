import { prisma } from '../../config/prisma';
import { generateSchedule } from './schedule.service';
import { PaymentType } from '../../constants/status';

export class EducationService {
  static async createCourse(data: {
    courseCode: string;
    name: string;
    description?: string;
    paymentType: PaymentType;
    bookSet?: string;
  }) {
    const existing = await prisma.course.findUnique({
      where: { courseCode: data.courseCode },
    });
    if (existing) {
      throw new Error(`Mã khóa học '${data.courseCode}' đã tồn tại.`);
    }

    return prisma.course.create({
      data: {
        courseCode: data.courseCode,
        name: data.name,
        description: data.description || null,
        paymentType: data.paymentType,
        bookSet: data.bookSet || null,
      },
    });
  }

  static async getCourses() {
    return prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { classes: true } },
      },
    });
  }

  static async createClass(data: {
    courseId: string;
    classCode: string;
    teacherId: string;
    staffId: string;
    capacity?: number;
    googleMeetLink?: string;
    startDate: string;
    totalClasses: number;
    classWeekdays: number[];
    startTime?: string;
    endTime?: string;
    holidays?: string[];
    holidayRanges?: Array<[string, string]>;
  }) {
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });
    if (!course) {
      throw new Error('Khóa học không tồn tại.');
    }

    const existingClass = await prisma.class.findUnique({
      where: { classCode: data.classCode },
    });
    if (existingClass) {
      throw new Error(`Mã lớp học '${data.classCode}' đã tồn tại.`);
    }

    const scheduleResult = generateSchedule({
      startDate: data.startDate,
      totalClasses: data.totalClasses,
      classWeekdays: data.classWeekdays,
      holidays: data.holidays,
      holidayRanges: data.holidayRanges,
    });

    const newClass = await prisma.class.create({
      data: {
        courseId: data.courseId,
        classCode: data.classCode,
        teacherId: data.teacherId,
        staffId: data.staffId,
        capacity: data.capacity || 30,
        googleMeetLink: data.googleMeetLink || null,
        startDate: data.startDate,
        endDate: scheduleResult.endDate,
        sessions: {
          create: scheduleResult.fullSchedule.map((sessionDate) => ({
            sessionDate,
            startTime: data.startTime || '19:00',
            endTime: data.endTime || '21:00',
          })),
        },
      },
      include: {
        course: true,
        teacher: { select: { id: true, fullName: true, email: true } },
        staff: { select: { id: true, fullName: true, email: true } },
        sessions: true,
      },
    });

    return newClass;
  }

  static async getClassDetail(classId: string, currentUser?: { id: string; role: string }) {
    const classDetail = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: true,
        teacher: { select: { id: true, fullName: true, email: true, phone: true } },
        staff: { select: { id: true, fullName: true, email: true, phone: true } },
        sessions: { orderBy: { sessionDate: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!classDetail) {
      throw new Error('Lớp học không tồn tại.');
    }

    if (currentUser && currentUser.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          classId: classId,
          studentId: currentUser.id,
        },
      });

      if (enrollment && enrollment.accessLocked) {
        return {
          ...classDetail,
          googleMeetLink: null,
          isAccessLocked: true,
          lockReason: 'Quyền truy cập link Google Meet đã bị khóa do có học phí quá hạn. Vui lòng thanh toán để mở lại.',
        };
      }
    }

    return classDetail;
  }
}
