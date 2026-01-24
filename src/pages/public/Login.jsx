import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiAcademicCap } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, motion } from '../../components/common';

/**
 * Login Page
 * 
 * User authentication form with email and password.
 * Animated card entrance for better UX.
 */
export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        <div className="auth-page">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <div className="auth-card__header">
                    <Link to="/" className="navbar__logo" style={{ display: 'block', marginBottom: 'var(--space-md)' }}>
                        <HiAcademicCap style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Videmy
                    </Link>
                    <h1 className="auth-card__title">Welcome Back</h1>
                    <p className="auth-card__subtitle">
                        Sign in to continue your learning journey
                    </p>
                </div>

                <form className="auth-card__form" onSubmit={handleSubmit}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        autoComplete="email"
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        autoComplete="current-password"
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        loading={loading}
                    >
                        <HiLockClosed />
                        Sign In
                    </Button>
                </form>

                <div className="auth-card__footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--color-primary-light)' }}>
                            Create one
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
