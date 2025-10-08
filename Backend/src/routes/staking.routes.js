import express from 'express';
import {
  createStake,
  getMyStakes,
  getStakeById,
  cancelStake,
  getAllStakes,
  updateStakeStatus
} from '../controllers/staking.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate, validationSchemas } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', validate(validationSchemas.createStake), createStake);
router.get('/', getMyStakes);
router.get('/:id', validate(validationSchemas.idParam), getStakeById);
router.patch('/:id/cancel', validate(validationSchemas.idParam), cancelStake);

// Admin only routes
router.get('/admin/all', authorize(['admin']), getAllStakes);
router.patch('/:id/status', authorize(['admin']), validate(validationSchemas.idParam), updateStakeStatus);

export default router;