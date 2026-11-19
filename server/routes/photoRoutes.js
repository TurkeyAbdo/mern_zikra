import { Router } from 'express';
import multer from 'multer';
import * as photos from '../controllers/photoController.js';
import { validate, validId, photoFields } from '../middleware/validation.js';
import { requireUser } from '../middleware/session.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 2, fieldSize: 8192 },
});
const router = Router();
router.param('id', validId);
router.get('/', photos.getAll);
router.get('/:id', photos.getOne);
router.post(
  '/',
  requireUser,
  upload.single('photo'),
  validate(photoFields),
  photos.create,
);
router.delete('/:id', requireUser, photos.remove);
export default router;
