import { Router } from 'express';
import * as loanController from '../controllers/loanController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('borrower', 'admin'));

router.post('/', loanController.createLoan);
router.get('/', loanController.getLoans);
router.get('/:id', loanController.getLoanById);
router.get('/:id/status-history', loanController.getLoanStatusHistory);
router.post('/:id/documents', loanController.uploadLoanDocument);

export default router;
