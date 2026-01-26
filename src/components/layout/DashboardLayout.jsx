import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Box, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { DashboardSidebar, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import { useAuth } from '../../context/AuthContext';

/**
 * Dashboard Layout Component
 * 
 * Main layout wrapper for authenticated pages.
 * Includes collapsible sidebar and top bar.
 */
export function DashboardLayout() {
    const theme = useTheme();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, loading } = useAuth();

    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Persist sidebar state in localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('sidebarOpen');
        if (savedState !== null) {
            setSidebarOpen(JSON.parse(savedState));
        }
    }, []);

    const handleSidebarToggle = () => {
        const newState = !sidebarOpen;
        setSidebarOpen(newState);
        localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    };

    const handleMobileClose = () => {
        setMobileOpen(false);
    };

    const handleMobileOpen = () => {
        setMobileOpen(true);
    };

    // Calculate current sidebar width
    const currentSidebarWidth = isMobile
        ? 0
        : sidebarOpen
            ? SIDEBAR_WIDTH
            : SIDEBAR_COLLAPSED_WIDTH;

    // Show loading while checking auth
    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <DashboardSidebar
                open={sidebarOpen}
                onToggle={handleSidebarToggle}
                mobileOpen={mobileOpen}
                onMobileClose={handleMobileClose}
            />

            {/* Top Bar */}
            <DashboardTopBar
                sidebarOpen={sidebarOpen}
                sidebarWidth={currentSidebarWidth}
                onMenuClick={handleMobileOpen}
            />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { xs: '100%', md: `calc(100% - ${currentSidebarWidth}px)` },
                    ml: { md: 0 },
                    mt: '64px', // TopBar height
                    p: { xs: 2, sm: 2.5, md: 3 }, // Responsive padding
                    bgcolor: 'background.default',
                    minHeight: 'calc(100vh - 64px)',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default DashboardLayout;
