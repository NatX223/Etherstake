import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate, validationSchemas } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.use(authorize(['admin']));

// Get all users
router.get('/', getUsers);

// Get, update, delete user by ID
router.get('/:id', validate(validationSchemas.idParam), getUserById);
router.patch('/:id', validate(validationSchemas.idParam), updateUser);
router.delete('/:id', validate(validationSchemas.idParam), deleteUser);

export default router;