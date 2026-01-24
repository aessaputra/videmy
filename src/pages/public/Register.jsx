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
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Visibility,
    VisibilityOff,
    School as SchoolIcon,
} from '@mui/icons-material';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { useAuth, ROLES } from '../../context/AuthContext';

// Motion wrapper
const MotionCard = motion.create(Card);

/**
 * Register Page
 * 
 * MUI-based user registration form with name, email, password.
 * Animated card entrance for better UX.
 */
export function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { register } = useAuth();
    const navigate = useNavigate();

    /**
     * Validate form fields
     */
    const validateForm = () => {
        const newErrors = {};

        if (!name) {
            newErrors.name = 'Name is required';
        } else if (name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

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

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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

        const result = await register(email, password, name, ROLES.STUDENT);

        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Registration failed. Please try again.');
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
                            Create Account
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ mb: 4 }}
                        >
                            Start your learning journey today
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                                autoComplete="name"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2 }}
                            />

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
                                autoComplete="new-password"
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
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                autoComplete="new-password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
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
                                startIcon={<PersonIcon />}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </Box>

                        <Typography
                            variant="body2"
                            textAlign="center"
                            sx={{ mt: 3 }}
                        >
                            Already have an account?{' '}
                            <Typography
                                component={Link}
                                to="/login"
                                color="primary"
                                sx={{ textDecoration: 'none', fontWeight: 500 }}
                            >
                                Sign in
                            </Typography>
                        </Typography>
                    </CardContent>
                </MotionCard>
            </Container>
        </Box>
    );
}

export default Register;
