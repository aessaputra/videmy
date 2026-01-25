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
    MenuItem,
    Grid,
    CssBaseline,
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Visibility,
    VisibilityOff,
    // School as SchoolIcon, // Removed as we remove the logo
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuth, ROLES } from '../../context/AuthContext';
import Content from '../../components/auth/Content';

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
    const [role, setRole] = useState(ROLES.STUDENT);
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

        const result = await register(email, password, name, role);

        if (result.success) {
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } else {
            toast.error(result.error || 'Registration failed. Please try again.');
        }

        setLoading(false);
    };

    return (
        <Grid container component="main" sx={{ height: '100vh', overflow: 'hidden' }}>
            <CssBaseline enableColorScheme />

            {/* Left Side - Image/Content (30%) */}
            <Grid
                item
                xs={false}
                md={false} /* Disable auto-width */
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: { md: '30%' },
                    flexBasis: { md: '30%' },
                    maxWidth: { md: '30%' },
                    height: '100%',
                }}
            >
                <Content />
            </Grid>

            {/* Right Side - Register Form (70%) */}
            <Grid
                item
                xs={12}
                md={false}
                sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    ...theme.applyStyles?.('dark', {
                        bgcolor: 'hsl(220, 30%, 5%)', // Deep Navy base
                    }),
                    position: 'relative',
                    width: { xs: '100%', md: '70%' },
                    flexBasis: { xs: '100%', md: '70%' },
                    maxWidth: { xs: '100%', md: '70%' },
                    borderLeft: { md: '1px solid' },
                    borderColor: { md: 'divider' },
                    height: '100%',
                    overflow: 'hidden', // Outer container hides overflow
                })}
            >
                {/* Pattern Background (Fixed relative to panel) */}
                <Box
                    sx={(theme) => ({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                        opacity: 0.4,
                        backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
                        backgroundRepeat: 'no-repeat',
                        display: { xs: 'none', md: 'block' },
                        ...theme.applyStyles?.('dark', {
                            /* Dark mode: Deep Navy Blue */
                            backgroundImage: 'radial-gradient(at 50% 50%, hsla(220, 30%, 12%, 0.7), hsl(220, 30%, 5%))',
                            bgcolor: 'hsl(220, 30%, 5%)',
                            opacity: 1, // Ensure full visibility in dark mode
                        }),
                    })}
                />

                {/* Scrollable Content Area */}
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto', // Scroll happens here
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center', // Vertically center the content
                        p: { xs: 2, md: 8 },
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: { xs: '480px', md: '600px' } }}>
                        <Box
                            sx={(theme) => ({
                                display: 'flex',
                                flexDirection: 'column',
                                alignSelf: 'center',
                                width: '100%',
                                padding: theme.spacing(4),
                                gap: theme.spacing(2),
                                margin: 'auto',
                                [theme.breakpoints.up('sm')]: {
                                    maxWidth: '480px',
                                },
                                [theme.breakpoints.up('md')]: {
                                    maxWidth: '100%',
                                    paddingLeft: theme.spacing(8),
                                    paddingRight: theme.spacing(8),
                                },
                            })}
                        >
                            <Typography
                                component="h1"
                                variant="h4"
                                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                            >
                                Sign up
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
                                    select
                                    fullWidth
                                    label="I am a"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    sx={{ mb: 2 }}
                                >
                                    <MenuItem value={ROLES.STUDENT}>Student</MenuItem>
                                    <MenuItem value={ROLES.INSTRUCTOR}>Instructor</MenuItem>
                                </TextField>

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
                        </Box>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}

export default Register;
