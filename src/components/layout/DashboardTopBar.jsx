import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip,
    Badge,
    Button,
    useTheme,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
    Settings as SettingsIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Home as HomeIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useColorScheme } from '@mui/material/styles';

/**
 * Dashboard Top Bar Component
 * 
 * Mini navbar for dashboard with user menu, notifications, and mobile toggle.
 */
export function DashboardTopBar({ sidebarOpen, sidebarWidth, onMenuClick }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user, logout, hasRole } = useAuth();
    const { mode, setMode } = useColorScheme();

    const [anchorEl, setAnchorEl] = useState(null);
    const userMenuOpen = Boolean(anchorEl);

    const handleUserMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleUserMenuClose();
        await logout();
        navigate('/login');
    };

    const handleThemeToggle = () => {
        setMode(mode === 'dark' ? 'light' : 'dark');
    };

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get role display text
    const getRoleDisplay = () => {
        if (hasRole(ROLES.ADMIN)) return 'Admin';
        if (hasRole(ROLES.INSTRUCTOR)) return 'Instructor';
        return 'Student';
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { md: `calc(100% - ${sidebarWidth}px)` },
                ml: { md: `${sidebarWidth}px` },
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Left side - Menu toggle (mobile) + Public Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{
                            mr: 1,
                            display: { md: 'none' },
                            color: 'text.primary',
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* View Public Site - Left Side */}
                    <Button
                        component={Link}
                        to="/"
                        startIcon={<HomeIcon />}
                        sx={{
                            color: 'text.primary',
                            textTransform: 'none',
                            fontWeight: 500,
                        }}
                    >
                        Home
                    </Button>
                </Box>

                {/* Right side - Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Theme Toggle */}
                    <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                        <IconButton
                            onClick={handleThemeToggle}
                            sx={{ color: 'text.primary' }}
                        >
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    {/* Notifications */}
                    <Tooltip title="Notifications">
                        <IconButton sx={{ color: 'text.primary' }}>
                            <Badge badgeContent={0} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* User Menu */}
                    <Tooltip title="Account">
                        <IconButton
                            onClick={handleUserMenuClick}
                            size="small"
                            sx={{ ml: 1 }}
                            aria-controls={userMenuOpen ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={userMenuOpen ? 'true' : undefined}
                        >
                            <Avatar
                                src={user?.avatar}
                                alt={user?.name}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'primary.main',
                                    fontSize: '0.875rem',
                                }}
                            >
                                {getInitials(user?.name)}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={userMenuOpen}
                        onClose={handleUserMenuClose}
                        onClick={handleUserMenuClose}
                        slotProps={{
                            paper: {
                                elevation: 4,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                                    mt: 1.5,
                                    minWidth: 200,
                                    '&::before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {/* User Info */}
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {user?.name || 'User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'inline-block',
                                    mt: 0.5,
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                }}
                            >
                                {getRoleDisplay()}
                            </Typography>
                        </Box>

                        <Divider />

                        <MenuItem
                            component={Link}
                            to="/profile"
                        >
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Profile</ListItemText>
                        </MenuItem>

                        <MenuItem
                            component={Link}
                            to="/settings"
                        >
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Settings</ListItemText>
                        </MenuItem>

                        <Divider />

                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText sx={{ color: 'error.main' }}>
                                Logout
                            </ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default DashboardTopBar;
