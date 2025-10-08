import { firestore } from '../config/firebase.js';

/**
 * Generic Firebase service for common database operations
 */
class FirebaseService {
  /**
   * Create a new document in a collection
   * @param {string} collection - Collection name
   * @param {Object} data - Document data
   * @param {string} [id] - Optional document ID
   * @returns {Promise<Object>} - Created document with ID
   */
  static async create(collection, data, id = null) {
    try {
      const docRef = id 
        ? firestore.collection(collection).doc(id)
        : firestore.collection(collection).doc();
      
      // Add timestamps
      const timestamp = new Date();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      await docRef.set(docData);
      
      // Return the created document with ID
      return {
        id: docRef.id,
        ...docData,
      };
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Get a document by ID
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} - Document data or null if not found
   */
  static async getById(collection, id) {
    try {
      const docRef = firestore.collection(collection).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error(`Error getting document from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Get documents with optional filtering
   * @param {string} collection - Collection name
   * @param {Object} [filters] - Optional filters
   * @param {number} [limit] - Optional limit
   * @param {number} [offset] - Optional offset for pagination
   * @param {string} [orderBy] - Optional field to order by
   * @param {string} [orderDirection] - Optional order direction ('asc' or 'desc')
   * @returns {Promise<Array>} - Array of documents
   */
  static async getMany(collection, filters = {}, limit = 10, offset = 0, orderBy = 'createdAt', orderDirection = 'desc') {
    try {
      let query = firestore.collection(collection);
      
      // Apply filters
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          query = query.where(field, '==', value);
        }
      });
      
      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy, orderDirection);
      }
      
      // Apply pagination
      if (offset > 0) {
        // Firestore doesn't have direct offset, so we need to use limit and startAfter
        // This is a simplified approach and might not be efficient for large offsets
        const snapshot = await query.limit(offset).get();
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        
        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }
      }
      
      // Apply limit
      query = query.limit(limit);
      
      // Execute query
      const snapshot = await query.get();
      
      // Map results
      const results = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return results;
    } catch (error) {
      console.error(`Error getting documents from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated document
   */
  static async update(collection, id, data) {
    try {
      const docRef = firestore.collection(collection).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Document not found in ${collection} with ID: ${id}`);
      }
      
      // Add updated timestamp
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      
      await docRef.update(updateData);
      
      // Get the updated document
      const updatedDoc = await docRef.get();
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      };
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  static async delete(collection, id) {
    try {
      const docRef = firestore.collection(collection).doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error(`Document not found in ${collection} with ID: ${id}`);
      }
      
      await docRef.delete();
      
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Count documents in a collection with optional filtering
   * @param {string} collection - Collection name
   * @param {Object} [filters] - Optional filters
   * @returns {Promise<number>} - Count of documents
   */
  static async count(collection, filters = {}) {
    try {
      let query = firestore.collection(collection);
      
      // Apply filters
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          query = query.where(field, '==', value);
        }
      });
      
      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error(`Error counting documents in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Check if a document exists
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} - True if document exists
   */
  static async exists(collection, id) {
    try {
      const docRef = firestore.collection(collection).doc(id);
      const doc = await docRef.get();
      
      return doc.exists;
    } catch (error) {
      console.error(`Error checking if document exists in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Find a document by a field value
   * @param {string} collection - Collection name
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {Promise<Object|null>} - Document data or null if not found
   */
  static async findByField(collection, field, value) {
    try {
      const snapshot = await firestore
        .collection(collection)
        .where(field, '==', value)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error(`Error finding document by field in ${collection}:`, error);
      throw error;
    }
  }
}

export default FirebaseService;