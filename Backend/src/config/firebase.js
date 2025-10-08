import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if running in production or development
const isProd = process.env.NODE_ENV === 'production';

// Initialize Firebase Admin SDK
let firebaseApp;
let db;

const initializeFirebase = () => {
  try {
    // If service account credentials are provided as environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Parse the service account JSON from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } else {
      // For local development, you might use a local service account file
      // or initialize with application default credentials
      firebaseApp = initializeApp();
    }
    
    // Initialize Firestore
    db = getFirestore();
    db.settings({ ignoreUndefinedProperties: true });
    
    console.log('Firebase initialized successfully');
    return { firebaseApp, db };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Initialize Firebase on module import
const { db: firestore } = initializeFirebase();

export { firestore };