import { Request, Response } from 'express';
import { EducationService } from './education.service';
import { generateSchedule } from './schedule.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class EducationController {
  static async createCourse(req: Request, res: Response) {
    try {
      const course = await EducationService.createCourse(req.body);
      return sendSuccess(res, course, 'Tạo khóa học thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getCourses(_req: Request, res: Response) {
    try {
      const courses = await EducationService.getCourses();
      return sendSuccess(res, courses, 'Lấy danh sách khóa học thành công');
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async createClass(req: Request, res: Response) {
    try {
      const classObj = await EducationService.createClass(req.body);
      return sendSuccess(res, classObj, 'Khai giảng lớp học mới và tạo lịch tự động thành công', 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getClassDetail(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const classDetail = await EducationService.getClassDetail(id, req.user);
      return sendSuccess(res, classDetail, 'Lấy chi tiết lớp học thành công');
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  static async calculateSchedule(req: Request, res: Response) {
    try {
      const result = generateSchedule(req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: [{ field: 'schedule', reason: error.message }],
        },
      });
    }
  }
}
