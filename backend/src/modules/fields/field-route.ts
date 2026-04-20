import { Router } from 'express';
import multer from 'multer';
import {
  handleCreateField,
  handleGetAllFields,
  handleGetFieldById,
  handleUpdateField,
  handleAssignField,
  handleCreateFieldUpdate,
  handleGetFieldUpdates,
  handleGetAgentUpdates,
  handleGetMyFields,
  handleRefreshFieldStatus
} from './field-http-request-handlers.js';
import { validateField, validateFieldUpdate, validateAssignField } from './field-validation.js';
import { authenticate, authorize } from '../auth/auth-middleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.get('/mine', handleGetMyFields);
router.get('/updates/mine', handleGetAgentUpdates);

router.post('/', authorize(['admin']), upload.array('images'), validateField, handleCreateField);
router.get('/', handleGetAllFields);
router.get('/:id', handleGetFieldById);
router.put('/:id', authorize(['admin']), upload.array('images'), validateField, handleUpdateField);
router.patch('/:id/assign', authorize(['admin']), validateAssignField, handleAssignField);

router.post('/:id/updates', authorize(['field_agent', 'admin']), validateFieldUpdate, handleCreateFieldUpdate);
router.get('/:id/updates', handleGetFieldUpdates);
router.post('/:id/refresh-status', handleRefreshFieldStatus);

export default router;
