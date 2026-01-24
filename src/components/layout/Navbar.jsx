import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    Container,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Avatar,
    Divider,
    useTheme,
    useMediaQuery,
    Chip,
    alpha,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    School as SchoolIcon,
    Logout as LogoutIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Login as LoginIcon,
    PersonAdd as PersonAddIcon,
    Dashboard as DashboardIcon,
    Home as HomeIcon,
    PlayCircle as PlayCircleIcon,
    AdminPanelSettings as AdminIcon,
    People as PeopleIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useColorScheme } from '@mui/material/styles';
import videmyLogo from '../../assets/videmy-logo.png';

/**
 * Navbar Component
 * 
 * MUI AppBar with glassmorphism effect and user dropdown menu.
 * Follows MUI best practices for Menu component.
 */
export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, isAuthenticated, logout, hasRole, ROLES } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Color scheme for dark/light mode toggle
    const { mode, setMode } = useColorScheme();

    // User menu state
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
        navigate('/');
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleThemeToggle = () => {
        setMode(mode === 'dark' ? 'light' : 'dark');
    };

    // Navigation links based on role
    const navLinks = [
        { to: '/', label: 'Home', icon: HomeIcon },
        { to: '/courses', label: 'Courses', icon: PlayCircleIcon },
    ];

    const authNavLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, roles: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN] },
        { to: '/admin/courses', label: 'Manage Courses', icon: AdminIcon, roles: [ROLES.INSTRUCTOR, ROLES.ADMIN] },
        { to: '/admin/users', label: 'Users', icon: PeopleIcon, roles: [ROLES.ADMIN] },
    ];

    // Get user role display name
    const getUserRole = () => {
        if (user?.labels?.includes(ROLES.ADMIN)) return 'Admin';
        if (user?.labels?.includes(ROLES.INSTRUCTOR)) return 'Instructor';
        return 'Student';
    };

    // Mobile drawer content
    const drawer = (
        <Box sx={{ width: 300, pt: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                    <Typography variant="h6" fontWeight={700} color="primary">
                        Videmy
                    </Typography>
                </Box>
                <IconButton onClick={handleDrawerToggle} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />

            {/* User info (if logged in) */}
            {isAuthenticated && (
                <Box sx={{ px: 2.5, py: 2, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                                {user?.name || 'User'}
                            </Typography>
                            <Chip
                                label={getUserRole()}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Navigation */}
            <List sx={{ flexGrow: 1, px: 1 }}>
                {navLinks.map((link) => (
                    <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            component={NavLink}
                            to={link.to}
                            onClick={handleDrawerToggle}
                            sx={{
                                borderRadius: 2,
                                '&.active': {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <link.icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={link.label} />
                        </ListItemButton>
                    </ListItem>
                ))}

                {isAuthenticated && <Divider sx={{ my: 1.5 }} />}

                {isAuthenticated &&
                    authNavLinks
                        .filter((link) => hasRole(link.roles))
                        .map((link) => (
                            <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    component={NavLink}
                                    to={link.to}
                                    onClick={handleDrawerToggle}
                                    sx={{
                                        borderRadius: 2,
                                        '&.active': {
                                            bgcolor: 'primary.main',
                                            color: 'primary.contrastText',
                                            '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <link.icon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={link.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
            </List>

            {/* Footer Actions */}
            <Divider />
            <Box sx={{ p: 2 }}>
                {!isAuthenticated ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Button
                            component={NavLink}
                            to="/login"
                            variant="outlined"
                            fullWidth
                            startIcon={<LoginIcon />}
                            onClick={handleDrawerToggle}
                        >
                            Sign In
                        </Button>
                        <Button
                            component={NavLink}
                            to="/register"
                            variant="contained"
                            fullWidth
                            startIcon={<PersonAddIcon />}
                            onClick={handleDrawerToggle}
                        >
                            Sign Up
                        </Button>
                    </Box>
                ) : (
                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={() => {
                            handleLogout();
                            handleDrawerToggle();
                        }}
                    >
                        Sign Out
                    </Button>
                )}
            </Box>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={(theme) => ({
                    bgcolor: alpha(
                        theme.palette.background.paper,
                        theme.palette.mode === 'dark' ? 0.85 : 0.8
                    ),
                    backdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        theme.palette.mode === 'dark' ? 0.3 : 0.1
                    )}`,
                    boxShadow: theme.palette.mode === 'dark'
                        ? `0 1px 3px ${alpha('#000', 0.3)}`
                        : 'none',
                })}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ gap: 2, minHeight: { xs: 64, md: 70 } }}>
                        {/* Logo */}
                        <Box
                            component={Link}
                            to="/"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                textDecoration: 'none',
                                flexGrow: { xs: 1, md: 0 },
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
                            <Typography
                                variant="h5"
                                component="span"
                                color="primary"
                                sx={{
                                    fontWeight: 800,
                                    display: { xs: 'none', sm: 'block' },
                                }}
                            >
                                Videmy
                            </Typography>
                        </Box>

                        {/* Desktop Navigation */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1, ml: 4 }}>
                            {navLinks.map((link) => (
                                <Button
                                    key={link.to}
                                    component={NavLink}
                                    to={link.to}
                                    color="inherit"
                                    sx={{
                                        color: 'text.secondary',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        fontWeight: 500,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            color: 'text.primary',
                                        },
                                        '&.active': {
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                        },
                                    }}
                                >
                                    {link.label}
                                </Button>
                            ))}

                            {isAuthenticated &&
                                authNavLinks
                                    .filter((link) => hasRole(link.roles))
                                    .map((link) => (
                                        <Button
                                            key={link.to}
                                            component={NavLink}
                                            to={link.to}
                                            color="inherit"
                                            sx={{
                                                color: 'text.secondary',
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2,
                                                fontWeight: 500,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                    color: 'text.primary',
                                                },
                                                '&.active': {
                                                    color: 'primary.main',
                                                    fontWeight: 600,
                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                                },
                                            }}
                                        >
                                            {link.label}
                                        </Button>
                                    ))}
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Theme Toggle */}
                            <IconButton
                                onClick={handleThemeToggle}
                                sx={{
                                    bgcolor: 'action.hover',
                                    '&:hover': { bgcolor: 'action.selected' },
                                }}
                            >
                                {mode === 'dark' ? (
                                    <LightModeIcon sx={{ color: 'warning.main' }} />
                                ) : (
                                    <DarkModeIcon sx={{ color: 'text.secondary' }} />
                                )}
                            </IconButton>

                            {isAuthenticated ? (
                                <>
                                    {/* User Avatar with Dropdown Menu */}
                                    <IconButton
                                        onClick={handleUserMenuClick}
                                        size="small"
                                        aria-controls={userMenuOpen ? 'user-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={userMenuOpen ? 'true' : undefined}
                                        sx={{
                                            p: 0.5,
                                            border: userMenuOpen ? 2 : 0,
                                            borderColor: 'primary.main',
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: 'primary.main',
                                                width: 36,
                                                height: 36,
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                            }}
                                        >
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </IconButton>

                                    {/* User Dropdown Menu */}
                                    <Menu
                                        id="user-menu"
                                        anchorEl={anchorEl}
                                        open={userMenuOpen}
                                        onClose={handleUserMenuClose}
                                        onClick={handleUserMenuClose}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                        slotProps={{
                                            paper: {
                                                elevation: 0,
                                                sx: {
                                                    overflow: 'visible',
                                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                                                    mt: 1.5,
                                                    minWidth: 200,
                                                    borderRadius: 2,
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
                                    >
                                        {/* User Info Header */}
                                        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {user?.name || 'User'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {user?.email}
                                            </Typography>
                                        </Box>

                                        {/* Menu Items */}
                                        <MenuItem
                                            component={Link}
                                            to="/dashboard"
                                            sx={{ py: 1.5 }}
                                        >
                                            <ListItemIcon>
                                                <DashboardIcon fontSize="small" />
                                            </ListItemIcon>
                                            Dashboard
                                        </MenuItem>

                                        <MenuItem sx={{ py: 1.5 }}>
                                            <ListItemIcon>
                                                <PersonIcon fontSize="small" />
                                            </ListItemIcon>
                                            Profile
                                        </MenuItem>

                                        <MenuItem sx={{ py: 1.5 }}>
                                            <ListItemIcon>
                                                <SettingsIcon fontSize="small" />
                                            </ListItemIcon>
                                            Settings
                                        </MenuItem>

                                        <Divider />

                                        <MenuItem
                                            onClick={handleLogout}
                                            sx={{
                                                py: 1.5,
                                                color: 'error.main',
                                                '&:hover': {
                                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                                },
                                            }}
                                        >
                                            <ListItemIcon>
                                                <LogoutIcon fontSize="small" color="error" />
                                            </ListItemIcon>
                                            Sign Out
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    <Button
                                        component={Link}
                                        to="/login"
                                        variant="text"
                                        sx={{
                                            display: { xs: 'none', sm: 'flex' },
                                            color: 'text.primary',
                                            fontWeight: 600,
                                            '&:hover': { bgcolor: 'action.hover' },
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        component={Link}
                                        to="/register"
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            display: { xs: 'none', md: 'flex' },
                                            fontWeight: 600,
                                            px: 3,
                                            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                            '&:hover': {
                                                boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                                            },
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </>
                            )}

                            {/* Mobile Menu Toggle */}
                            <IconButton
                                aria-label="open drawer"
                                edge="end"
                                onClick={handleDrawerToggle}
                                sx={{
                                    display: { md: 'none' },
                                    bgcolor: 'action.hover',
                                    '&:hover': { bgcolor: 'action.selected' },
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: 300,
                        borderRadius: '16px 0 0 16px',
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}

export default Navbar;
