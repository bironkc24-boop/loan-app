import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/loans', adminController.getAllLoans);
router.put('/loans/:id', adminController.updateLoanStatus);
router.post('/loans/:id/assign', adminController.assignRider);

router.get('/riders', adminController.getAllRiders);
router.post('/riders', adminController.createRider);

router.get('/metrics', adminController.getMetrics);

export default router;
