import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.put('/me', userController.updateProfile);
router.put('/me/borrower-profile', userController.updateBorrowerProfile);
router.get('/:id', userController.getUserById);

export default router;
