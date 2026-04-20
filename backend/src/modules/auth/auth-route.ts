import { Router } from 'express';
import { handleSignup, handleLogin } from './auth-http-request-handlers.ts';
import { signupValidation, loginValidation } from './auth-validation.ts';

const router = Router();

router.post('/signup', signupValidation, handleSignup);
router.post('/login', loginValidation, handleLogin);

export default router;
