import { Router } from 'express';
import * as riderController from '../controllers/riderController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('rider'));

router.get('/assignments', riderController.getAssignments);
router.put('/assignments/:id/status', riderController.updateAssignmentStatus);
router.put('/availability', riderController.updateAvailability);
router.get('/metrics', riderController.getMetrics);

export default router;
