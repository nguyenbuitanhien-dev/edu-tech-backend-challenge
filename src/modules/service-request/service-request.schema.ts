import { z } from 'zod';
import { ServiceRequestStatus } from '../../constants/status';

export const createServiceRequestSchema = z.object({
  body: z.object({
    serviceName: z.string().min(2, 'Tên dịch vụ phải từ 2 ký tự trở lên'),
    contactInfo: z.string().min(5, 'Thông tin liên hệ (Email/SĐT/Tên) không được để trống'),
  }),
});

export const updateServiceRequestStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID dịch vụ không hợp lệ'),
  }),
  body: z.object({
    status: z.nativeEnum(ServiceRequestStatus),
    staffId: z.string().uuid('ID nhân viên không hợp lệ').optional(),
    responseNote: z.string().optional(),
  }),
});

export const submitFeedbackSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID dịch vụ không hợp lệ'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5, 'Đánh giá phải từ 1 đến 5 sao'),
    feedbackComment: z.string().optional(),
  }),
});
