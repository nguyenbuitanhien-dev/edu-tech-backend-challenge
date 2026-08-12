import { z } from 'zod';
import { EnrollmentStatus } from '../../constants/status';

export const createEnrollmentSchema = z.object({
  body: z.object({
    classId: z.string().uuid('must be a valid UUID'),
    studentId: z.string().uuid('must be a valid UUID').optional(),
  }),
});

export const updateEnrollmentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('must be a valid UUID'),
  }),
  body: z.object({
    status: z.nativeEnum(EnrollmentStatus),
  }),
});

export const payPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('must be a valid UUID'),
  }),
  body: z.object({
    paidDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be in YYYY-MM-DD format').optional(),
  }),
});

export const invoiceCalcSchema = z.object({
  body: z
    .object({
      courseType: z.enum(['MONTHLY', 'FULL_COURSE'], {
        required_error: 'is required',
        invalid_type_error: "must be 'MONTHLY' or 'FULL_COURSE'",
      }),
      basePrice: z
        .number({ required_error: 'is required' })
        .min(0, 'must be greater than or equal to 0'),
      months: z.number().int('must be an integer').optional(),
      promoCode: z.string().nullable().optional(),
      canceledClasses: z
        .number()
        .int('must be an integer')
        .min(0, 'must be greater than or equal to 0')
        .optional()
        .default(0),
      refundPerClass: z
        .number()
        .min(0, 'must be greater than or equal to 0')
        .optional()
        .default(0),
    })
    .superRefine((data, ctx) => {
      if (data.courseType === 'MONTHLY') {
        if (data.months === undefined || data.months < 1 || data.months > 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['months'],
            message: 'must be between 1 and 3',
          });
        }
      }

      if (data.promoCode !== undefined && data.promoCode !== null && data.promoCode !== '') {
        const code = String(data.promoCode).trim().toUpperCase();
        if (code !== 'SAVE10' && code !== 'FLAT50K') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['promoCode'],
            message: "must be 'SAVE10', 'FLAT50K' or null",
          });
        }
      }
    }),
});
