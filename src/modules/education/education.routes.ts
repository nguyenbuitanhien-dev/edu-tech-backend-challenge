import { Router } from 'express';
import { EducationController } from './education.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth.middleware';
import { createCourseSchema, createClassSchema, scheduleGeneratorSchema } from './education.schema';
import { Role } from '../../constants/roles';

const router = Router();

// Courses API
router.post(
  '/courses',
  authenticateJWT,
  authorizeRoles(Role.MANAGER, Role.STAFF),
  validate(createCourseSchema),
  EducationController.createCourse
);
router.get('/courses', EducationController.getCourses);

// Classes API
router.post(
  '/classes',
  authenticateJWT,
  authorizeRoles(Role.MANAGER, Role.STAFF),
  validate(createClassSchema),
  EducationController.createClass
);
router.get('/classes/:id', authenticateJWT, EducationController.getClassDetail);

// Bài 2 Endpoint: Tính lịch học & ngày bế giảng
router.post('/classes/generate-schedule', validate(scheduleGeneratorSchema), EducationController.calculateSchedule);

export default router;
