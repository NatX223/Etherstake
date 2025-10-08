import FirebaseService from './firebase.service.js';
import UserService from './user.service.js';
import { ApiError } from '../middleware/error.middleware.js';

// Collection name for stakes
const COLLECTION = 'stakes';

/**
 * Stake service for handling stake-related operations
 */
class StakeService {
  /**
   * Create a new stake
   * @param {Object} stakeData - Stake data
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Created stake
   */
  static async createStake(stakeData, userId) {
    try {
      const { amount, duration, walletAddress } = stakeData;
      
      // Calculate end date based on duration (in days)
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration);
      
      // Calculate estimated rewards (simplified calculation)
      // In a real application, this would be more complex based on various factors
      const estimatedRewards = (amount * duration * 0.01) / 365; // Simple 1% APY calculation
      
      // Create stake
      const stake = await FirebaseService.create(COLLECTION, {
        userId,
        amount,
        duration,
        walletAddress,
        startDate,
        endDate,
        estimatedRewards,
        actualRewards: 0,
        status: 'active',
        transactionHash: stakeData.transactionHash || null,
      });
      
      // Add stake to user
      await UserService.addStakeToUser(userId, stake.id);
      
      return stake;
    } catch (error) {
      console.error('Error creating stake:', error);
      throw error;
    }
  }

  /**
   * Get stake by ID
   * @param {string} id - Stake ID
   * @returns {Promise<Object|null>} - Stake data or null if not found
   */
  static async getStakeById(id) {
    try {
      return await FirebaseService.getById(COLLECTION, id);
    } catch (error) {
      console.error('Error getting stake by ID:', error);
      throw error;
    }
  }

  /**
   * Get stakes by user ID
   * @param {string} userId - User ID
   * @param {number} [limit=10] - Limit
   * @param {number} [offset=0] - Offset
   * @returns {Promise<Object>} - Stakes with pagination info
   */
  static async getStakesByUserId(userId, limit = 10, offset = 0) {
    try {
      // Get stakes by user ID
      const stakes = await FirebaseService.getMany(
        COLLECTION,
        { userId },
        limit,
        offset
      );
      
      // Get total count
      const total = await FirebaseService.count(COLLECTION, { userId });
      
      return {
        stakes,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting stakes by user ID:', error);
      throw error;
    }
  }

  /**
   * Get all stakes with pagination
   * @param {number} [limit=10] - Limit
   * @param {number} [offset=0] - Offset
   * @param {Object} [filters={}] - Filters
   * @returns {Promise<Object>} - Stakes with pagination info
   */
  static async getAllStakes(limit = 10, offset = 0, filters = {}) {
    try {
      // Get stakes
      const stakes = await FirebaseService.getMany(
        COLLECTION,
        filters,
        limit,
        offset
      );
      
      // Get total count
      const total = await FirebaseService.count(COLLECTION, filters);
      
      return {
        stakes,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting all stakes:', error);
      throw error;
    }
  }

  /**
   * Update stake
   * @param {string} id - Stake ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - Updated stake
   */
  static async updateStake(id, updateData) {
    try {
      // Check if stake exists
      const existingStake = await FirebaseService.getById(COLLECTION, id);
      
      if (!existingStake) {
        throw new ApiError(404, 'Stake not found');
      }
      
      // Update stake
      return await FirebaseService.update(COLLECTION, id, updateData);
    } catch (error) {
      console.error('Error updating stake:', error);
      throw error;
    }
  }

  /**
   * Cancel stake
   * @param {string} id - Stake ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Cancelled stake
   */
  static async cancelStake(id, userId) {
    try {
      // Check if stake exists
      const existingStake = await FirebaseService.getById(COLLECTION, id);
      
      if (!existingStake) {
        throw new ApiError(404, 'Stake not found');
      }
      
      // Check if stake belongs to user
      if (existingStake.userId !== userId) {
        throw new ApiError(403, 'You are not authorized to cancel this stake');
      }
      
      // Check if stake is already cancelled or completed
      if (existingStake.status === 'cancelled' || existingStake.status === 'completed') {
        throw new ApiError(400, `Stake is already ${existingStake.status}`);
      }
      
      // Calculate penalties for early cancellation if applicable
      let penalties = 0;
      const currentDate = new Date();
      const endDate = new Date(existingStake.endDate);
      
      if (currentDate < endDate) {
        // Calculate remaining days
        const remainingDays = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
        const totalDays = existingStake.duration;
        
        // Apply penalty based on remaining days (e.g., 5% of remaining proportion)
        penalties = (existingStake.amount * remainingDays * 0.05) / totalDays;
      }
      
      // Update stake
      return await FirebaseService.update(COLLECTION, id, {
        status: 'cancelled',
        cancelledAt: new Date(),
        penalties,
        actualRewards: 0, // No rewards for cancelled stakes
      });
    } catch (error) {
      console.error('Error cancelling stake:', error);
      throw error;
    }
  }

  /**
   * Complete stake
   * @param {string} id - Stake ID
   * @returns {Promise<Object>} - Completed stake
   */
  static async completeStake(id) {
    try {
      // Check if stake exists
      const existingStake = await FirebaseService.getById(COLLECTION, id);
      
      if (!existingStake) {
        throw new ApiError(404, 'Stake not found');
      }
      
      // Check if stake is already completed or cancelled
      if (existingStake.status === 'completed' || existingStake.status === 'cancelled') {
        throw new ApiError(400, `Stake is already ${existingStake.status}`);
      }
      
      // Check if stake has reached end date
      const currentDate = new Date();
      const endDate = new Date(existingStake.endDate);
      
      if (currentDate < endDate) {
        throw new ApiError(400, 'Stake has not reached end date yet');
      }
      
      // Calculate actual rewards (in a real application, this would be more complex)
      const actualRewards = existingStake.estimatedRewards;
      
      // Update stake
      return await FirebaseService.update(COLLECTION, id, {
        status: 'completed',
        completedAt: new Date(),
        actualRewards,
      });
    } catch (error) {
      console.error('Error completing stake:', error);
      throw error;
    }
  }

  /**
   * Get total staked amount
   * @returns {Promise<number>} - Total staked amount
   */
  static async getTotalStakedAmount() {
    try {
      // Get all active stakes
      const activeStakes = await FirebaseService.getMany(COLLECTION, { status: 'active' });
      
      // Calculate total staked amount
      return activeStakes.reduce((total, stake) => total + parseFloat(stake.amount), 0);
    } catch (error) {
      console.error('Error getting total staked amount:', error);
      throw error;
    }
  }

  /**
   * Get total rewards paid
   * @returns {Promise<number>} - Total rewards paid
   */
  static async getTotalRewardsPaid() {
    try {
      // Get all completed stakes
      const completedStakes = await FirebaseService.getMany(COLLECTION, { status: 'completed' });
      
      // Calculate total rewards paid
      return completedStakes.reduce((total, stake) => total + parseFloat(stake.actualRewards), 0);
    } catch (error) {
      console.error('Error getting total rewards paid:', error);
      throw error;
    }
  }
}

export default StakeService;