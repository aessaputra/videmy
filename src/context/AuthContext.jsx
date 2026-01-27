import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { client, account, databases, avatars, ID, DATABASE_ID, COLLECTIONS, Query, getUserAvatar } from '../lib/appwrite';

/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 * Handles login, register, logout, and role-based access.
 */

// User roles constants
export const ROLES = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student',
};

// Create the context
const AuthContext = createContext(null);

/**
 * Custom hook to access auth context
 * @returns {AuthContextValue} Auth context value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Get user role from preferences
     * @param {Object} userData - User data from Appwrite
     * @returns {string} User role
     */
    const getUserRole = (userData) => {
        return userData?.prefs?.role || ROLES.STUDENT;
    };

    /**
     * Initialize auth state on mount
     */
    const init = useCallback(async () => {
        try {
            const userData = await account.get();

            // Try to fetch user profile from Database
            let userProfile = null;
            try {
                const profileRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    [Query.equal('userId', userData.$id)]
                );

                if (profileRes.documents.length > 0) {
                    userProfile = profileRes.documents[0];
                } else {
                    // Lazy create if missing (migration path)
                    userProfile = await databases.createDocument(
                        DATABASE_ID,
                        COLLECTIONS.USERS,
                        ID.unique(),
                        {
                            userId: userData.$id,
                            name: userData.name,
                            email: userData.email,
                            role: userData.prefs?.role || 'student',
                            status: 'active'
                        }
                    );
                }
            } catch (dbError) {
                console.warn('Failed to fetch/create user profile:', dbError);
                // Fallback to existing prefs if DB fails
            }

            setUser({
                ...userData,
                role: userProfile?.role || getUserRole(userData),
                status: userProfile?.status || 'active',
                profileId: userProfile?.$id,
                avatar: getUserAvatar(userProfile || userData)
            });

            // Security Check: If user is banned/inactive in DB, force logout
            if (userProfile?.status === 'inactive') {
                await account.deleteSession('current');
                setUser(null);
                throw new Error('Account is suspended');
            }
        } catch (error) {
            // User not logged in or Suspended
            console.warn('Auth Init Error:', error.message);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        init();
    }, [init]);

    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} name - User display name
     * @param {string} role - User role (default: student)
     */
    const register = async (email, password, name, role = ROLES.STUDENT) => {
        try {
            // Create the account (only declare once)
            const newAccount = await account.create(ID.unique(), email, password, name);

            // Login immediately (REQUIRED before creating DB document with "users" permission)
            await account.createEmailPasswordSession(email, password);

            // Create Data in Database
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    ID.unique(),
                    {
                        userId: newAccount.$id,
                        name: name,
                        email: email,
                        role: role,
                        status: 'active'
                    }
                );
            } catch (dbError) {
                console.error('Failed to create user profile:', dbError);
                // Don't fail the whole registration if DB fails, but warn.
                // Or maybe we should? For now just log.
            }

            // Set the user role in preferences (Legacy/Backup)
            await account.updatePrefs({ role });

            // Refresh user state
            await init();

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Login existing user
     * @param {string} email - User email
     * @param {string} password - User password
     */
    const login = async (email, password) => {
        try {
            await account.createEmailPasswordSession(email, password);
            await init();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Logout current user
     */
    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Check if user has required role
     * @param {string|string[]} requiredRoles - Required role(s)
     * @returns {boolean} Whether user has required role
     */
    const hasRole = (requiredRoles) => {
        if (!user) return false;
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        // Admin has access to everything
        if (user.role === ROLES.ADMIN) return true;

        // Instructor has access to instructor and student routes
        if (user.role === ROLES.INSTRUCTOR && roles.includes(ROLES.INSTRUCTOR)) return true;

        // Check if user's role is in required roles
        return roles.includes(user.role);
    };

    /**
     * Check if user is authenticated
     */
    const isAuthenticated = !!user;

    const value = {
        user,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
        hasRole,
        ROLES,
        refreshUser: init, // Expose init to allow manual refresh
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
