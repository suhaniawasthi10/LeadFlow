import { Router } from 'express';
import * as leadsController from '../controllers/leadsController';
import * as discussionsController from '../controllers/discussionsController';

const router = Router();

router.post('/', leadsController.createLead);
router.get('/', leadsController.listLeads);
router.get('/:id', leadsController.getLead);
router.patch('/:id', leadsController.updateLead);
router.post('/:id/discussions', discussionsController.createDiscussion);

export default router;
