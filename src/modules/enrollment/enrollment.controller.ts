import { Request, Response } from 'express';
import { EnrollmentService } from './enrollment.service';
import { PaymentService } from './payment.service';
import { calcInvoice } from './invoice-calculator.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class EnrollmentController {
  static async createEnrollment(req: AuthRequest, res: Response) {
    try {
      const studentId = req.body.studentId || req.user?.id;
      if (!studentId) {
        return sendError(res, 'Chưa xác định được học viên đăng ký', 400);
      }

      const enrollment = await EnrollmentService.createEnrollment(studentId, req.body.classId);
      return sendSuccess(res, enrollment, 'Đăng ký lớp học thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await EnrollmentService.updateStatus(id, status);
      return sendSuccess(res, updated, 'Cập nhật trạng thái đăng ký thành công');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getMyEnrollments(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Chưa đăng nhập', 401);
      }
      const list = await EnrollmentService.getStudentEnrollments(req.user.id);
      return sendSuccess(res, list, 'Lấy danh sách đăng ký lớp học thành công');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async payPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { paidDate } = req.body;
      const result = await PaymentService.payPayment(id, paidDate);
      return sendSuccess(res, result, 'Thanh toán hóa đơn thành công');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async checkOverdue(_req: Request, res: Response) {
    try {
      const result = await PaymentService.checkAndUpdateOverduePayments();
      return sendSuccess(res, result, 'Quét và cập nhật hóa đơn quá hạn thành công');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async calculateInvoice(req: Request, res: Response) {
    try {
      const { courseType, basePrice, months, promoCode, canceledClasses, refundPerClass } = req.body;
      const result = calcInvoice(
        courseType,
        basePrice,
        months,
        promoCode,
        canceledClasses,
        refundPerClass
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: [{ field: 'invoice', reason: error.message }],
        },
      });
    }
  }
}
