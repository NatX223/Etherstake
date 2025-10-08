import jwt from 'jsonwebtoken';
import UserService from '../services/user.service.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Generate JWT token for authentication
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, walletAddress } = req.body;

    // Create user using UserService
    const user = await UserService.createUser({
      name,
      email,
      password,
      walletAddress,
    });

    // Generate token
    const token = generateToken(user.id);

    // Return user data
    res.status(201).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserService.findUserByEmail(email);

    // Check if user exists and password is correct
    if (!user || !(await UserService.isPasswordMatch(user.id, password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data
    res.status(200).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;

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
 * Update user profile
 * @route PATCH /api/auth/me
 */
export const updateMe = async (req, res, next) => {
  try {
    const { name, walletAddress } = req.body;
    const userId = req.user.id;

    // Update user using UserService
    const updatedUser = await UserService.updateUser(userId, { name, walletAddress });

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
 * Change password
 * @route PATCH /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Check if current password is correct
    if (!(await UserService.isPasswordMatch(userId, currentPassword))) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password using UserService
    await UserService.updateUser(userId, { password: newPassword });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};