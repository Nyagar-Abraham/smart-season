import { Router } from 'express';
import { handleSignup, handleLogin } from './auth-http-request-handlers.js';
import { signupValidation, loginValidation } from './auth-validation.js';

const router = Router();

router.post('/signup', signupValidation, handleSignup);
router.post('/login', loginValidation, handleLogin);

export default router;
