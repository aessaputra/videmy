// Common components barrel export
// Since we migrated to MUI, most common components now use MUI directly

// Route protection
export { ProtectedRoute, GuestRoute } from './ProtectedRoute';

// Loading component (wrapper around MUI CircularProgress)
export { Loading } from './Loading';

// Placeholder component
export { ComingSoon } from './ComingSoon';

// Re-export Motion for convenient animation imports
export { motion } from 'motion/react';
