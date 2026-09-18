import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validateBody } from '../../middleware/validateBody';
import { loginSchema } from './auth.schemas';
import * as authController from './auth.controller';

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);

// Logout only clears the refresh cookie, so it must remain available even if
// the short-lived access token has already expired.
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.me);

export default router;
