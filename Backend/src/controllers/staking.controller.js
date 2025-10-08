import StakeService from '../services/stake.service.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Create a new stake
 * @route POST /api/staking
 */
export const createStake = async (req, res, next) => {
  try {
    const { amount, duration, walletAddress, transactionHash } = req.body;
    const userId = req.user.id;

    // Validate wallet address belongs to user
    if (req.user.walletAddress !== walletAddress) {
      throw new ApiError(400, 'Wallet address does not match user wallet');
    }

    // Create stake using StakeService
    const stake = await StakeService.createStake(
      {
        amount,
        duration,
        walletAddress,
        transactionHash,
      },
      userId
    );

    res.status(201).json({
      status: 'success',
      data: {
        stake,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all stakes for current user
 * @route GET /api/staking
 */
export const getMyStakes = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Implement pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Get stakes with pagination
    const result = await StakeService.getStakesByUserId(userId, limit, offset);

    res.status(200).json({
      status: 'success',
      results: result.stakes.length,
      pagination: {
        total: result.pagination.total,
        page,
        pages: result.pagination.pages,
        limit,
      },
      data: {
        stakes: result.stakes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get stake by ID
 * @route GET /api/staking/:id
 */
export const getStakeById = async (req, res, next) => {
  try {
    const stakeId = req.params.id;
    const userId = req.user.id;

    // Find stake
    const stake = await StakeService.getStakeById(stakeId);

    // Check if stake exists
    if (!stake) {
      throw new ApiError(404, 'Stake not found');
    }

    // Check if stake belongs to user or user is admin
    if (stake.userId !== userId && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to access this stake');
    }

    res.status(200).json({
      status: 'success',
      data: {
        stake,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel stake
 * @route PATCH /api/staking/:id/cancel
 */
export const cancelStake = async (req, res, next) => {
  try {
    const stakeId = req.params.id;
    const userId = req.user.id;

    // Cancel stake using StakeService
    const stake = await StakeService.cancelStake(stakeId, userId);

    res.status(200).json({
      status: 'success',
      data: {
        stake,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all stakes (admin only)
 * @route GET /api/staking/admin
 */
export const getAllStakes = async (req, res, next) => {
  try {
    // Implement pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Build filters
    const filters = {};
    
    // Add status filter if provided
    if (req.query.status && ['active', 'completed', 'cancelled'].includes(req.query.status)) {
      filters.status = req.query.status;
    }

    // Add user filter if provided
    if (req.query.userId) {
      filters.userId = req.query.userId;
    }

    // Get stakes with pagination
    const result = await StakeService.getAllStakes(limit, offset, filters);

    res.status(200).json({
      status: 'success',
      results: result.stakes.length,
      pagination: {
        total: result.pagination.total,
        page,
        pages: result.pagination.pages,
        limit,
      },
      data: {
        stakes: result.stakes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update stake status (admin only)
 * @route PATCH /api/staking/:id/status
 */
export const updateStakeStatus = async (req, res, next) => {
  try {
    const { status, transactionHash } = req.body;
    const stakeId = req.params.id;

    // Validate status
    if (!['active', 'completed', 'cancelled'].includes(status)) {
      throw new ApiError(400, 'Invalid status value');
    }

    // Update stake using StakeService
    const stake = await StakeService.updateStake(stakeId, { status, transactionHash });

    res.status(200).json({
      status: 'success',
      data: {
        stake,
      },
    });
  } catch (error) {
    next(error);
  }
};