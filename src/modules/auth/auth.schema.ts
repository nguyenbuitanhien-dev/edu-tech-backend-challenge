import { z } from 'zod';
import { Role } from '../../constants/roles';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
    role: z.nativeEnum(Role).optional().default(Role.STUDENT),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  }),
});
