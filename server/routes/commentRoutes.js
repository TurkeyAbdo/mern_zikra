import { Router } from 'express';
import { create } from '../controllers/commentController.js';
import { validate, validId, commentFields } from '../middleware/validation.js';
import { requireUser } from '../middleware/session.js';

const router = Router();
router.param('id', validId);
router.post('/:id/comments', requireUser, validate(commentFields), create);
export default router;
