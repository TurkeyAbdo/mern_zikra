import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { validate, registration, login } from '../middleware/validation.js';
import { requireUser } from '../middleware/session.js';

const router = Router();
router.post('/register', validate(registration), auth.register);
router.post('/login', validate(login), auth.login);
router.get('/me', requireUser, auth.me);
router.post('/logout', auth.logout);
export default router;
