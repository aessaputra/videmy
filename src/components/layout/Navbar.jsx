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
    Avatar,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    School as SchoolIcon,
    Logout as LogoutIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useColorScheme } from '@mui/material/styles';

/**
 * Navbar Component
 * 
 * MUI-based responsive navigation bar with mobile drawer.
 * Shows different links based on auth state and role.
 */
export function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isAuthenticated, logout, hasRole, ROLES } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Color scheme for dark/light mode toggle
    const { mode, setMode } = useColorScheme();

    const handleLogout = async () => {
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
        { to: '/', label: 'Home' },
        { to: '/courses', label: 'Courses' },
    ];

    const authNavLinks = [
        { to: '/dashboard', label: 'Dashboard', roles: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN] },
        { to: '/admin/courses', label: 'Manage Courses', roles: [ROLES.INSTRUCTOR, ROLES.ADMIN] },
        { to: '/admin/users', label: 'Users', roles: [ROLES.ADMIN] },
    ];

    // Mobile drawer content
    const drawer = (
        <Box sx={{ width: 280, pt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon color="primary" />
                    <Typography variant="h6" color="primary" fontWeight={700}>
                        Videmy
                    </Typography>
                </Box>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />
            <List>
                {navLinks.map((link) => (
                    <ListItem key={link.to} disablePadding>
                        <ListItemButton
                            component={NavLink}
                            to={link.to}
                            onClick={handleDrawerToggle}
                        >
                            <ListItemText primary={link.label} />
                        </ListItemButton>
                    </ListItem>
                ))}

                {isAuthenticated &&
                    authNavLinks
                        .filter((link) => hasRole(link.roles))
                        .map((link) => (
                            <ListItem key={link.to} disablePadding>
                                <ListItemButton
                                    component={NavLink}
                                    to={link.to}
                                    onClick={handleDrawerToggle}
                                >
                                    <ListItemText primary={link.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
            </List>
            <Divider />
            <List>
                {!isAuthenticated ? (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton component={NavLink} to="/login" onClick={handleDrawerToggle}>
                                <ListItemText primary="Login" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={NavLink} to="/register" onClick={handleDrawerToggle}>
                                <ListItemText primary="Register" />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : (
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                handleLogout();
                                handleDrawerToggle();
                            }}
                        >
                            <LogoutIcon sx={{ mr: 2 }} />
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ gap: 2 }}>
                        {/* Logo */}
                        <Box
                            component={Link}
                            to="/"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                textDecoration: 'none',
                                flexGrow: { xs: 1, md: 0 },
                            }}
                        >
                            <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
                            <Typography
                                variant="h6"
                                component="span"
                                color="primary"
                                fontWeight={700}
                                sx={{ display: { xs: 'none', sm: 'block' } }}
                            >
                                Videmy
                            </Typography>
                        </Box>

                        {/* Desktop Navigation */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexGrow: 1, ml: 4 }}>
                            {navLinks.map((link) => (
                                <Button
                                    key={link.to}
                                    component={NavLink}
                                    to={link.to}
                                    color="inherit"
                                    sx={{
                                        color: 'text.secondary',
                                        '&.active': {
                                            color: 'primary.main',
                                            fontWeight: 600,
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
                                                '&.active': {
                                                    color: 'primary.main',
                                                    fontWeight: 600,
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
                            <IconButton onClick={handleThemeToggle} color="inherit">
                                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>

                            {isAuthenticated ? (
                                <>
                                    <Avatar
                                        sx={{
                                            bgcolor: 'primary.main',
                                            width: 36,
                                            height: 36,
                                            display: { xs: 'none', sm: 'flex' },
                                        }}
                                    >
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Button
                                        color="inherit"
                                        onClick={handleLogout}
                                        startIcon={<LogoutIcon />}
                                        sx={{ display: { xs: 'none', md: 'flex' } }}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        component={Link}
                                        to="/login"
                                        color="inherit"
                                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        component={Link}
                                        to="/register"
                                        variant="contained"
                                        color="primary"
                                        sx={{ display: { xs: 'none', md: 'flex' } }}
                                    >
                                        Get Started
                                    </Button>
                                </>
                            )}

                            {/* Mobile Menu Toggle */}
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="end"
                                onClick={handleDrawerToggle}
                                sx={{ display: { md: 'none' } }}
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
                    '& .MuiDrawer-paper': { width: 280 },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}

export default Navbar;
