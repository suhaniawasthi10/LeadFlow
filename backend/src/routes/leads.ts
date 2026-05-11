import { Router } from 'express';
import * as leadsController from '../controllers/leadsController';
import * as discussionsController from '../controllers/discussionsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Every lead/discussion route is tenant-scoped — auth runs before any handler.
router.use(requireAuth);

router.post('/', leadsController.createLead);
router.get('/', leadsController.listLeads);
router.get('/:id', leadsController.getLead);
router.patch('/:id', leadsController.updateLead);
router.delete('/:id', leadsController.deleteLead);
router.post('/:id/discussions', discussionsController.createDiscussion);

export default router;
