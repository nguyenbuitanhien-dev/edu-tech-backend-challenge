import { z } from 'zod';
import { PaymentType } from '../../constants/status';

export const createCourseSchema = z.object({
  body: z.object({
    courseCode: z.string().min(2, 'must be at least 2 characters'),
    name: z.string().min(3, 'must be at least 3 characters'),
    description: z.string().optional(),
    paymentType: z.nativeEnum(PaymentType),
    bookSet: z.string().optional(),
  }),
});

export const createClassSchema = z.object({
  body: z.object({
    courseId: z.string().uuid('must be a valid UUID'),
    classCode: z.string().min(2, 'must be at least 2 characters'),
    teacherId: z.string().uuid('must be a valid UUID'),
    staffId: z.string().uuid('must be a valid UUID'),
    capacity: z.number().int().positive().optional().default(30),
    googleMeetLink: z.string().url('must be a valid URL').optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be in YYYY-MM-DD format'),
    totalClasses: z.number().int().min(1, 'must be at least 1'),
    classWeekdays: z.array(z.number().int().min(0).max(6)).min(1, 'must contain at least one weekday'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'must be HH:mm').optional().default('19:00'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'must be HH:mm').optional().default('21:00'),
    holidays: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    holidayRanges: z.array(z.tuple([z.string(), z.string()])).optional(),
  }),
});

export const scheduleGenerateSchema = z.object({
  body: z.object({
    startDate: z.string({ required_error: 'is required' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'must be in YYYY-MM-DD format'),
    totalClasses: z.number({ required_error: 'is required' }).int('must be an integer').min(1, 'must be greater than or equal to 1'),
    classWeekdays: z.array(z.number().int().min(0).max(6), { required_error: 'is required' }).min(1, 'must contain at least one weekday'),
    holidays: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be in YYYY-MM-DD format')).optional(),
    holidayRanges: z.array(z.tuple([z.string(), z.string()])).optional(),
  }),
});

export const scheduleGeneratorSchema = scheduleGenerateSchema;
