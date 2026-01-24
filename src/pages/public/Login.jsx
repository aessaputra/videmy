import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    School as SchoolIcon,
} from '@mui/icons-material';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// Motion wrapper
const MotionCard = motion.create(Card);

/**
 * Login Page
 * 
 * MUI-based user authentication form with email and password.
 * Animated card entrance for better UX.
 */
export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useAuth();
    const navigate = useNavigate();

    /**
     * Validate form fields
     */
    const validateForm = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            toast.success('Welcome back!');
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Login failed. Please check your credentials.');
        }

        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 200px)',
                display: 'flex',
                alignItems: 'center',
                py: 6,
            }}
        >
            <Container maxWidth="sm">
                <MotionCard
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    sx={{ p: { xs: 3, sm: 4 } }}
                >
                    <CardContent>
                        {/* Logo */}
                        <Box
                            component={Link}
                            to="/"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                textDecoration: 'none',
                                mb: 3,
                                justifyContent: 'center',
                            }}
                        >
                            <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
                            <Typography variant="h5" color="primary" fontWeight={700}>
                                Videmy
                            </Typography>
                        </Box>

                        <Typography variant="h5" fontWeight={600} textAlign="center" gutterBottom>
                            Welcome Back
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ mb: 4 }}
                        >
                            Sign in to continue your learning journey
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                                autoComplete="email"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!errors.password}
                                helperText={errors.password}
                                autoComplete="current-password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading}
                                startIcon={<LockIcon />}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </Box>

                        <Typography
                            variant="body2"
                            textAlign="center"
                            sx={{ mt: 3 }}
                        >
                            Don't have an account?{' '}
                            <Typography
                                component={Link}
                                to="/register"
                                color="primary"
                                sx={{ textDecoration: 'none', fontWeight: 500 }}
                            >
                                Create one
                            </Typography>
                        </Typography>
                    </CardContent>
                </MotionCard>
            </Container>
        </Box>
    );
}

export default Login;
