import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';

/**
 * Appwrite Client Configuration
 * 
 * This module initializes and exports the Appwrite client and service instances.
 * All Appwrite interactions should go through these exported instances.
 */

// Initialize the Appwrite client
export const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export utilities
export { ID, Query, Permission, Role };

// Database constants
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';

// Collection IDs - will be created in Appwrite console
export const COLLECTIONS = {
    COURSES: 'courses',
    MODULES: 'modules',
    LESSONS: 'lessons',
    ENROLLMENTS: 'enrollments',
    PROGRESS: 'progress',
};

export default client;
