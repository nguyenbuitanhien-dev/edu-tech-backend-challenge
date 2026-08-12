import { Router } from 'express';
import { ServiceRequestController } from './service-request.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticateJWT, authorizeRoles } from '../../middlewares/auth.middleware';
import {
  createServiceRequestSchema,
  updateServiceRequestStatusSchema,
  submitFeedbackSchema,
} from './service-request.schema';
import { Role } from '../../constants/roles';

const router = Router();

// Public / Authenticated creation
router.post(
  '/service-requests',
  validate(createServiceRequestSchema),
  ServiceRequestController.createRequest
);

// Get list of requests
router.get('/service-requests', authenticateJWT, ServiceRequestController.getRequests);

// Staff/Manager updates status (auto audit log)
router.patch(
  '/service-requests/:id/status',
  authenticateJWT,
  authorizeRoles(Role.MANAGER, Role.STAFF),
  validate(updateServiceRequestStatusSchema),
  ServiceRequestController.updateStatus
);

// Get audit logs
router.get('/service-requests/:id/logs', authenticateJWT, ServiceRequestController.getLogs);

// Submit rating & feedback
router.post(
  '/service-requests/:id/rating',
  authenticateJWT,
  validate(submitFeedbackSchema),
  ServiceRequestController.submitRating
);

export default router;
