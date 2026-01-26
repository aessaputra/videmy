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
    SwipeableDrawer,
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
    CardHeader,
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
    const colorScheme = useColorScheme();
    const { mode, setMode } = colorScheme;

    // iOS detection for SwipeableDrawer performance optimization
    const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

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

    // Note: Dashboard is now only in user dropdown menu, not in main nav
    // This keeps the public navbar clean and focused

    // Get user role display name
    const getUserRole = () => {
        if (user?.labels?.includes(ROLES.ADMIN)) return 'Admin';
        if (user?.labels?.includes(ROLES.INSTRUCTOR)) return 'Instructor';
        return 'Student';
    };

    // Mobile drawer content - Enhanced & Touch-friendly
    const drawer = (
        <Box
            sx={{
                width: 300,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
            }}
        >
            {/* Header with Logo */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2.5,
                    py: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                    <Typography variant="h6" fontWeight={700} color="primary">
                        Videmy
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleDrawerToggle}
                    size="small"
                    sx={{
                        bgcolor: 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* User Profile Section - Clean Design */}
            {/* User Profile Section - Clean Design with CardHeader */}
            {isAuthenticated && (
                <Box
                    sx={{
                        bgcolor: 'action.hover',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <CardHeader
                        avatar={
                            <Avatar
                                src={user?.avatar}
                                alt={user?.name}
                                sx={{
                                    bgcolor: 'primary.main',
                                    width: 56,
                                    height: 56,
                                    fontSize: '1.4rem',
                                    fontWeight: 600,
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                        }
                        title={
                            <Typography variant="subtitle1" fontWeight={600} noWrap>
                                {user?.name || 'User'}
                            </Typography>
                        }
                        subheader={
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ display: 'block', mb: 0.5 }}
                                >
                                    {user?.email}
                                </Typography>
                                <Chip
                                    label={getUserRole()}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{
                                        height: 22,
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>
                        }
                        sx={{ px: 2.5, py: 2.5 }}
                    />
                </Box>
            )}

            {/* Navigation Sections */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
                {/* Main Navigation */}
                <List sx={{ px: 1.5 }}>
                    <Typography
                        variant="overline"
                        color="text.secondary"
                        sx={{ px: 1.5, py: 1, display: 'block', fontSize: '0.65rem', letterSpacing: 1.5 }}
                    >
                        Menu
                    </Typography>
                    {navLinks.map((link) => (
                        <ListItem key={link.to} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={NavLink}
                                to={link.to}
                                onClick={handleDrawerToggle}
                                sx={{
                                    borderRadius: 2,
                                    minHeight: 48,
                                    px: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                        transform: 'translateX(4px)',
                                    },
                                    '&.active': {
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                        '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 44 }}>
                                    <link.icon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={link.label}
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                {/* Account Section */}
                {isAuthenticated && (
                    <List sx={{ px: 1.5 }}>
                        <Typography
                            variant="overline"
                            color="text.secondary"
                            sx={{ px: 1.5, py: 1, display: 'block', fontSize: '0.65rem', letterSpacing: 1.5 }}
                        >
                            Quick Access
                        </Typography>
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={NavLink}
                                to="/dashboard"
                                onClick={handleDrawerToggle}
                                sx={{
                                    borderRadius: 2,
                                    minHeight: 48,
                                    px: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                        transform: 'translateX(4px)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 44 }}>
                                    <DashboardIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Dashboard"
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </List>
                )}
            </Box>

            {/* Footer - Theme Toggle & Auth Actions */}
            <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                {/* Theme Toggle */}
                <Box
                    sx={{
                        px: 2.5,
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'action.hover',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {mode === 'dark' ? (
                            <DarkModeIcon sx={{ color: 'text.secondary' }} />
                        ) : (
                            <LightModeIcon sx={{ color: 'warning.main' }} />
                        )}
                        <Typography variant="body2" fontWeight={500}>
                            {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleThemeToggle}
                        size="small"
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': { bgcolor: 'background.paper' },
                        }}
                    >
                        {mode === 'dark' ? (
                            <LightModeIcon fontSize="small" sx={{ color: 'warning.main' }} />
                        ) : (
                            <DarkModeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        )}
                    </IconButton>
                </Box>

                {/* Auth Actions */}
                <Box sx={{ p: 2 }}>
                    {!isAuthenticated ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Button
                                component={NavLink}
                                to="/login"
                                variant="outlined"
                                fullWidth
                                size="large"
                                startIcon={<LoginIcon />}
                                onClick={handleDrawerToggle}
                                sx={{ borderRadius: 2 }}
                            >
                                Sign In
                            </Button>
                            <Button
                                component={NavLink}
                                to="/register"
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<PersonAddIcon />}
                                onClick={handleDrawerToggle}
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>
                    ) : (
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            size="large"
                            startIcon={<LogoutIcon />}
                            onClick={() => {
                                handleLogout();
                                handleDrawerToggle();
                            }}
                            sx={{
                                borderRadius: 2,
                                '&:hover': {
                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                },
                            }}
                        >
                            Sign Out
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
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
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Theme Toggle - Desktop Only (hidden on mobile, available in drawer) */}
                            <IconButton
                                onClick={handleThemeToggle}
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
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
                                    {/* User Avatar with Dropdown Menu - Desktop Only (md+) */}
                                    <IconButton
                                        onClick={handleUserMenuClick}
                                        size="small"
                                        aria-controls={userMenuOpen ? 'user-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={userMenuOpen ? 'true' : undefined}
                                        sx={{
                                            display: { xs: 'none', md: 'flex' },
                                            p: 0.5,
                                            border: userMenuOpen ? 2 : 0,
                                            borderColor: 'primary.main',
                                            transition: 'border 0.2s ease',
                                        }}
                                    >
                                        <Avatar
                                            src={user?.avatar}
                                            alt={user?.name}
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

                                    {/* User Dropdown Menu - Desktop Only */}
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
                                                    minWidth: 240,
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
                                        {/* User Info Header - Desktop Only */}
                                        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {user?.name || 'User'}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    maxWidth: 180,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
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

            {/* Mobile Drawer - SwipeableDrawer for gesture support */}
            <SwipeableDrawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                onOpen={() => setMobileOpen(true)}
                disableBackdropTransition={!iOS}
                disableDiscovery={iOS}
                swipeAreaWidth={20}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: 300,
                        borderRadius: '20px 0 0 20px',
                        boxShadow: '-8px 0 30px rgba(0,0,0,0.15)',
                    },
                    '& .MuiBackdrop-root': {
                        backdropFilter: 'blur(4px)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                    },
                }}
            >
                {drawer}
            </SwipeableDrawer>
        </>
    );
}

export default Navbar;
