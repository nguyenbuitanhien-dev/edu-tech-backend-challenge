import { Router } from 'express';
import { EnrollmentController } from './enrollment.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth.middleware';
import { createEnrollmentSchema, updateEnrollmentStatusSchema, payPaymentSchema } from './enrollment.schema';
import { Role } from '../../constants/roles';

const router = Router();

// Enrollment APIs
router.post(
  '/enrollments',
  authenticateJWT,
  validate(createEnrollmentSchema),
  EnrollmentController.createEnrollment
);

router.patch(
  '/enrollments/:id/status',
  authenticateJWT,
  authorizeRoles(Role.MANAGER, Role.STAFF),
  validate(updateEnrollmentStatusSchema),
  EnrollmentController.updateStatus
);

router.get('/students/my-enrollments', authenticateJWT, EnrollmentController.getMyEnrollments);

// Payment APIs
router.post('/payments/:id/pay', authenticateJWT, validate(payPaymentSchema), EnrollmentController.payPayment);

router.post(
  '/payments/check-overdue',
  authenticateJWT,
  authorizeRoles(Role.MANAGER, Role.STAFF),
  EnrollmentController.checkOverdue
);

// Bài 3 Endpoint: Tính học phí theo gói + khuyến mãi + hoàn tiền
router.post('/invoices/calculate', EnrollmentController.calculateInvoice);

export default router;
