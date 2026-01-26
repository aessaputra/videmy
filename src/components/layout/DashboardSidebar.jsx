import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    Tooltip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    Add as AddIcon,
    LibraryBooks as CoursesIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useAuth, ROLES } from '../../context/AuthContext';
import videmyLogo from '../../assets/videmy-logo.png';

// Sidebar width constants
const DRAWER_WIDTH = 280;
const DRAWER_COLLAPSED_WIDTH = 72;

/**
 * Dashboard Sidebar Component
 * 
 * Collapsible sidebar with role-based navigation items.
 * Uses MUI Drawer with mini-variant pattern.
 */
export function DashboardSidebar({ open, onToggle, mobileOpen, onMobileClose }) {
    const theme = useTheme();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, hasRole } = useAuth();

    // Navigation items with role-based visibility
    const navItems = [
        {
            title: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
            roles: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN],
        },
        { divider: true, roles: [ROLES.INSTRUCTOR, ROLES.ADMIN] },
        {
            title: 'Create Course',
            icon: <AddIcon />,
            path: '/admin/courses/new',
            roles: [ROLES.INSTRUCTOR, ROLES.ADMIN],
        },
        {
            title: 'Manage Courses',
            icon: <CoursesIcon />,
            path: '/admin/courses',
            roles: [ROLES.INSTRUCTOR, ROLES.ADMIN],
        },
        { divider: true, roles: [ROLES.ADMIN] },
        {
            title: 'Manage Users',
            icon: <PeopleIcon />,
            path: '/admin/users',
            roles: [ROLES.ADMIN],
        },
        {
            title: 'Analytics',
            icon: <AnalyticsIcon />,
            path: '/admin/analytics',
            roles: [ROLES.ADMIN],
        },
        { divider: true, roles: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN] },
        {
            title: 'Profile',
            icon: <PersonIcon />,
            path: '/profile',
            roles: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN],
        },
        {
            title: 'Settings',
            icon: <SettingsIcon />,
            path: '/settings',
            roles: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN],
        },
    ];

    // Filter items based on user role
    const filteredItems = navItems.filter(item => {
        if (!item.roles) return true;
        return item.roles.some(role => hasRole(role));
    });

    // Check if path is active
    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    // Drawer content
    const drawerContent = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'background.paper',
            }}
        >
            {/* Logo / Brand Area */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: open ? 'space-between' : 'center',
                    p: 2,
                    minHeight: 64,
                }}
            >
                {open ? (
                    <Box
                        component={NavLink}
                        to="/"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            textDecoration: 'none',
                        }}
                    >
                        <Box
                            component="img"
                            src={videmyLogo}
                            alt="Videmy Logo"
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                objectFit: 'contain',
                            }}
                        />
                        <Box
                            component="span"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 700,
                                fontSize: '1.5rem',
                            }}
                        >
                            Videmy
                        </Box>
                    </Box>
                ) : (
                    <Box
                        component={NavLink}
                        to="/"
                        sx={{ display: 'flex' }}
                    >
                        <Box
                            component="img"
                            src={videmyLogo}
                            alt="Videmy Logo"
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1,
                                objectFit: 'contain',
                            }}
                        />
                    </Box>
                )}
                {!isMobile && open && (
                    <IconButton onClick={onToggle} size="small">
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Box>

            {/* Collapse Toggle when sidebar is collapsed */}
            {!isMobile && !open && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <IconButton onClick={onToggle} size="small">
                        <ChevronRightIcon />
                    </IconButton>
                </Box>
            )}

            <Divider />

            {/* Navigation Items */}
            <List sx={{ flex: 1, px: 1, py: 2 }}>
                {filteredItems.map((item, index) => {
                    if (item.divider) {
                        return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
                    }

                    const isItemActive = isActive(item.path);

                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <Tooltip
                                title={open ? '' : item.title}
                                placement="right"
                                arrow
                            >
                                <ListItemButton
                                    component={NavLink}
                                    to={item.path}
                                    onClick={isMobile ? onMobileClose : undefined}
                                    sx={{
                                        minHeight: 48,
                                        borderRadius: 2,
                                        justifyContent: open ? 'initial' : 'center',
                                        px: 2.5,
                                        bgcolor: isItemActive
                                            ? 'primary.main'
                                            : 'transparent',
                                        color: isItemActive
                                            ? 'primary.contrastText'
                                            : 'text.primary',
                                        '&:hover': {
                                            bgcolor: isItemActive
                                                ? 'primary.dark'
                                                : 'action.hover',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 2 : 'auto',
                                            justifyContent: 'center',
                                            color: 'inherit',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.title}
                                        sx={{
                                            opacity: open ? 1 : 0,
                                            display: open ? 'block' : 'none',
                                        }}
                                    />
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    // Mobile drawer (temporary)
    if (isMobile) {
        return (
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        );
    }

    // Desktop drawer (permanent, collapsible)
    return (
        <Drawer
            variant="permanent"
            open={open}
            sx={{
                width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                '& .MuiDrawer-paper': {
                    width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH,
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflowX: 'hidden',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
}

export const SIDEBAR_WIDTH = DRAWER_WIDTH;
export const SIDEBAR_COLLAPSED_WIDTH = DRAWER_COLLAPSED_WIDTH;

export default DashboardSidebar;
