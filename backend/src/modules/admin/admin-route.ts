import { Router } from 'express';
import { handleGetAgents } from './admin-http-request-handlers.js';
import { authenticate, authorize } from '../auth/auth-middleware.js';

const router = Router();

// Only admins can access agent operations
router.get('/agents', authenticate, authorize(['admin']), handleGetAgents);

export default router;
