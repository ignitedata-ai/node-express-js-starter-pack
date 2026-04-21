import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/register', validateRequest({ body: { name: 'string', email: 'email', password: 'string' } }), register);
router.post('/login',    validateRequest({ body: { email: 'email', password: 'string' } }), login);
router.post('/refresh',  refreshToken);
router.post('/logout',   authenticate, logout);

export default router;
