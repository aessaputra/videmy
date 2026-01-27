import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../common';

/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication.
 * Optionally checks for specific roles.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string|string[]} props.roles - Required roles (optional)
 */
export function ProtectedRoute({ children, roles }) {
    const { isAuthenticated, loading, hasRole, user } = useAuth();
    const location = useLocation();

    // Show loading while checking auth
    if (loading) {
        return <Loading fullPage message="Checking authentication..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check status
    if (user?.status === 'pending') {
        // If they are pending, they can ONLY go to /pending-approval
        // We handle this by checking if the *route invoking this* allows pending?
        // Actually, cleaner way: Redirect to /pending-approval if not there.
        // We will define /pending-approval WITHOUT this standard ProtectedRoute logic or handle it carefully.
        // BUT, since we will use ProtectedRoute for everything, let's treat /pending-approval as a special case?
        // No, better to have a generic check.
        // Let's assume /pending-approval is the only place they can be.

        // If we are currently AT /pending-approval, we render children.
        // If we are NOT AT /pending-approval, we redirect TO /pending-approval.
        if (location.pathname !== '/pending-approval') {
            return <Navigate to="/pending-approval" replace />;
        }
    } else {
        // If we are active (not pending), and try to go to pending-approval, redirect to dashboard
        if (location.pathname === '/pending-approval') {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // Check role permission if roles are specified
    if (roles && !hasRole(roles)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}


/**
 * Guest Route Component
 * 
 * For routes that should only be accessible to non-authenticated users
 * (e.g., login, register pages)
 */
export function GuestRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loading fullPage message="Loading..." />;
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    return children;
}

export default ProtectedRoute;
