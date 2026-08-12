import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { Role } from '../../constants/roles';

export class AuthService {
  static async register(data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role?: Role;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email này đã được sử dụng trong hệ thống.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        passwordHash,
        role: data.role || Role.STUDENT,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return newUser;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    if (!user.isActive) {
      throw new Error('Tài khoản đã bị vô hiệu hóa.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-for-education-app-2026';
    const tokenPayload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as Role,
    };

    const token = jwt.sign(tokenPayload, secret, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken: token,
    };
  }
}
