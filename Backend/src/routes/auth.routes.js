import express from 'express';
import { register, login, getMe, updateMe, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, validationSchemas } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', validate(validationSchemas.register), register);
router.post('/login', validate(validationSchemas.login), login);

// Protected routes
router.use(authenticate);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/change-password', changePassword);

export default router;