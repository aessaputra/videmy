import { Client, Account, Databases, Storage, Avatars, ID, Query, Permission, Role } from 'appwrite';

/**
 * Appwrite Client Configuration
 * 
 * This module initializes and exports the Appwrite client and service instances.
 * All Appwrite interactions should go through these exported instances.
 */

// Initialize the Appwrite client
export const client = new Client();

// Export Configuration Constants
export const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
export const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

// Export utilities
export { ID, Query, Permission, Role };

// Database constants
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';

// Collection IDs - will be created in Appwrite console
export const COLLECTIONS = {
    USERS: 'users',
    COURSES: 'courses',
    MODULES: 'modules',
    LESSONS: 'lessons',
    ENROLLMENTS: 'enrollments',
    PROGRESS: 'progress',
};

// Storage Bucket ID
export const STORAGE_BUCKET_ID = '6975bc7500182fd9ac87';

/**
 * Get User Avatar URL
 * 
 * Returns an optimized avatar URL:
 * 1. Custom uploaded avatar (optimized via getFilePreview)
 * 2. Fallback to Appwrite Initials
 * 
 * @param {Object} user - User profile document or account object
 * @returns {string} Avatar URL
 */
export const getUserAvatar = (user) => {
    if (!user) return '';

    // 1. Try Custom Avatar (File ID stored in profile OR prefs)
    const avatarId = user.avatar || user.prefs?.avatar;
    if (avatarId) {
        try {
            // Check if it's potentially already a full URL (legacy/external)
            if (avatarId.startsWith('http')) {
                return avatarId;
            }

            // Return optimized preview for stored file ID
            // Width: 200, Height: 200, Gravity: Center, Quality: 90
            return storage.getFilePreview(
                STORAGE_BUCKET_ID,
                avatarId,
                200,
                200,
                'center',
                90
            ).href;
        } catch (error) {
            console.warn('Error generating avatar preview:', error);
        }
    }

    // 2. Fallback: Appwrite Initials
    try {
        const initialsUrl = avatars.getInitials(user.name);
        // Handle both URL object (SDK v14+) and String (older SDKs)
        return initialsUrl.href ? initialsUrl.href : initialsUrl;
    } catch (error) {
        console.warn('Error generating initials:', error);
        return '';
    }
};

export default client;
