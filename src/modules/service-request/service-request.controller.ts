import { Request, Response } from 'express';
import { ServiceRequestService } from './service-request.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class ServiceRequestController {
  static async createRequest(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.id || undefined;
      const result = await ServiceRequestService.createRequest({
        ...req.body,
        customerId,
      });
      return sendSuccess(res, result, 'Gửi yêu cầu dịch vụ công nghệ thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getRequests(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.role === 'STUDENT' ? req.user.id : undefined;
      const requests = await ServiceRequestService.getRequests(customerId);
      return sendSuccess(res, requests, 'Lấy danh sách yêu cầu dịch vụ thành công');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, staffId, responseNote } = req.body;
      const changedById = req.user!.id;

      const updated = await ServiceRequestService.updateStatus(
        id,
        status,
        changedById,
        staffId,
        responseNote
      );
      return sendSuccess(res, updated, 'Cập nhật trạng thái và ghi nhật ký log thành công');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getLogs(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const logs = await ServiceRequestService.getLogs(id);
      return sendSuccess(res, logs, 'Lấy nhật ký lịch sử cập nhật thành công');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async submitRating(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rating, feedbackComment } = req.body;
      const result = await ServiceRequestService.submitRating(id, rating, feedbackComment);
      return sendSuccess(res, result, 'Gửi đánh giá dịch vụ thành công');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
