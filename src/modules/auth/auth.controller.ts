import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.register(req.body);
      return sendSuccess(res, user, 'Đăng ký tài khoản thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendSuccess(res, result, 'Đăng nhập thành công', 200);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
