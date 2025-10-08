import User from '../models/user.model.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Get all users (admin only)
 * @route GET /api/users
 */
export const getUsers = async (req, res, next) => {
  try {
    // Implement pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      results: users.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (admin only)
 * @route GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (admin only)
 * @route PATCH /api/users/:id
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, walletAddress } = req.body;
    const userId = req.params.id;

    // Check if email is already taken
    if (email && await User.isEmailTaken(email, userId)) {
      throw new ApiError(400, 'Email is already taken');
    }

    // Check if wallet address is already taken
    if (walletAddress && await User.isWalletAddressTaken(walletAddress, userId)) {
      throw new ApiError(400, 'Wallet address is already associated with another account');
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role, walletAddress },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};