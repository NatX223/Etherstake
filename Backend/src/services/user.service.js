import bcrypt from 'bcryptjs';
import FirebaseService from './firebase.service.js';
import { ApiError } from '../middleware/error.middleware.js';

// Collection name for users
const COLLECTION = 'users';

/**
 * User service for handling user-related operations
 */
class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  static async createUser(userData) {
    try {
      const { name, email, password, walletAddress } = userData;
      
      // Check if email is already taken
      const existingUserByEmail = await this.findUserByEmail(email);
      if (existingUserByEmail) {
        throw new ApiError(400, 'Email is already taken');
      }
      
      // Check if wallet address is already taken (if provided)
      if (walletAddress) {
        const existingUserByWallet = await this.findUserByWalletAddress(walletAddress);
        if (existingUserByWallet) {
          throw new ApiError(400, 'Wallet address is already associated with another account');
        }
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await FirebaseService.create(COLLECTION, {
        name,
        email,
        password: hashedPassword,
        walletAddress,
        role: 'user',
        isEmailVerified: false,
        stakes: [],
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} - User data or null if not found
   */
  static async findUserById(id) {
    try {
      const user = await FirebaseService.getById(COLLECTION, id);
      
      if (!user) {
        return null;
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} - User data or null if not found
   */
  static async findUserByEmail(email) {
    try {
      return await FirebaseService.findByField(COLLECTION, 'email', email);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by wallet address
   * @param {string} walletAddress - User wallet address
   * @returns {Promise<Object|null>} - User data or null if not found
   */
  static async findUserByWalletAddress(walletAddress) {
    try {
      return await FirebaseService.findByField(COLLECTION, 'walletAddress', walletAddress);
    } catch (error) {
      console.error('Error finding user by wallet address:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - Updated user
   */
  static async updateUser(id, updateData) {
    try {
      // Check if user exists
      const existingUser = await FirebaseService.getById(COLLECTION, id);
      
      if (!existingUser) {
        throw new ApiError(404, 'User not found');
      }
      
      // Check if email is being updated and is already taken
      if (updateData.email && updateData.email !== existingUser.email) {
        const existingUserByEmail = await this.findUserByEmail(updateData.email);
        if (existingUserByEmail && existingUserByEmail.id !== id) {
          throw new ApiError(400, 'Email is already taken');
        }
      }
      
      // Check if wallet address is being updated and is already taken
      if (updateData.walletAddress && updateData.walletAddress !== existingUser.walletAddress) {
        const existingUserByWallet = await this.findUserByWalletAddress(updateData.walletAddress);
        if (existingUserByWallet && existingUserByWallet.id !== id) {
          throw new ApiError(400, 'Wallet address is already associated with another account');
        }
      }
      
      // Hash password if it's being updated
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      // Update user
      const updatedUser = await FirebaseService.update(COLLECTION, id, updateData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return userWithoutPassword;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  static async deleteUser(id) {
    try {
      return await FirebaseService.delete(COLLECTION, id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param {number} [limit=10] - Limit
   * @param {number} [offset=0] - Offset
   * @returns {Promise<Object>} - Users with pagination info
   */
  static async getUsers(limit = 10, offset = 0) {
    try {
      // Get users
      const users = await FirebaseService.getMany(COLLECTION, {}, limit, offset);
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      // Get total count
      const total = await FirebaseService.count(COLLECTION);
      
      return {
        users: usersWithoutPasswords,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Check if password matches
   * @param {string} userId - User ID
   * @param {string} password - Password to check
   * @returns {Promise<boolean>} - True if password matches
   */
  static async isPasswordMatch(userId, password) {
    try {
      const user = await FirebaseService.getById(COLLECTION, userId);
      
      if (!user) {
        return false;
      }
      
      return bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error checking password match:', error);
      throw error;
    }
  }

  /**
   * Add stake to user
   * @param {string} userId - User ID
   * @param {string} stakeId - Stake ID
   * @returns {Promise<Object>} - Updated user
   */
  static async addStakeToUser(userId, stakeId) {
    try {
      const user = await FirebaseService.getById(COLLECTION, userId);
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Add stake to user's stakes array
      const stakes = user.stakes || [];
      stakes.push(stakeId);
      
      // Update user
      return await FirebaseService.update(COLLECTION, userId, { stakes });
    } catch (error) {
      console.error('Error adding stake to user:', error);
      throw error;
    }
  }
}

export default UserService;