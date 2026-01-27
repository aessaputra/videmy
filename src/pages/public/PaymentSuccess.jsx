import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, Container, Stack, useTheme } from '@mui/material';
import { CheckCircle, ErrorOutline, Dashboard as DashboardIcon, Home as HomeIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { functions } from '../../lib/appwrite';

const MotionBox = motion.create(Box);

export function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [errorMessage, setErrorMessage] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        const verifyPayment = async () => {
            const sessionId = searchParams.get('session_id');

            if (!sessionId) {
                setStatus('error');
                setErrorMessage('No session ID found.');
                return;
            }

            try {
                // Call Payment Service
                const execution = await functions.createExecution(
                    import.meta.env.VITE_APPWRITE_FUNCTION_ID,
                    '', // GET request has no body
                    false, // Async: false (Wait for result)
                    `/verify?session_id=${sessionId}`,
                    'GET'
                );

                if (execution.status === 'completed') {
                    const response = JSON.parse(execution.responseBody);
                    if (response.ok) {
                        setStatus('success');
                        toast.success('Enrollment successful!');
                        // Optional: Auto redirect after 5 seconds
                        setTimeout(() => {
                            // Only redirect if still on page
                            if (window.location.pathname === '/payment-success') {
                                navigate('/dashboard');
                            }
                        }, 5000);
                    } else {
                        setStatus('error');
                        setErrorMessage(response.error || 'Verification failed');
                    }
                } else {
                    setStatus('error');
                    setErrorMessage('Server execution failed');
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                setErrorMessage('Network or Server Error');
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    // Dynamic styles based on theme mode
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                // Dynamic Gradient: Subtle in light, Darker/Cleaner in dark
                background: isDark
                    ? `radial-gradient(circle at 50% 50%, ${theme.palette.primary.dark}33 0%, ${theme.palette.background.default} 70%)`
                    : `radial-gradient(circle at 50% 50%, ${theme.palette.primary.light}33 0%, ${theme.palette.background.default} 60%)`,
            }}
        >
            <Container maxWidth="sm">
                <MotionBox
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: "outCirc" }}
                    sx={{
                        p: { xs: 3, sm: 4, md: 6 }, // Responsive padding
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        // Glassy border in dark mode, Shadow in light mode
                        boxShadow: isDark
                            ? '0 0 0 1px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.4)'
                            : '0px 20px 40px rgba(0,0,0,0.1)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <AnimatePresence mode="wait">
                        {status === 'verifying' && (
                            <MotionBox
                                key="verifying"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                                    {/* Pulse Animation */}
                                    <MotionBox
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        sx={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            zIndex: 0
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            width: { xs: 60, md: 80 }, // Responsive spinner size
                                            height: { xs: 60, md: 80 },
                                            borderRadius: '50%',
                                            border: '4px solid',
                                            borderColor: 'primary.main',
                                            borderTopColor: 'transparent',
                                            animation: 'spin 1s linear infinite',
                                            zIndex: 1
                                        }}
                                    />
                                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                </Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                    Verifying Payment
                                </Typography>
                                <Typography color="text.secondary">
                                    Securely confirming your transaction...
                                </Typography>
                            </MotionBox>
                        )}

                        {status === 'success' && (
                            <MotionBox
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <MotionBox
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    sx={{
                                        width: { xs: 60, md: 80 }, // Responsive icon container
                                        height: { xs: 60, md: 80 },
                                        borderRadius: '50%',
                                        bgcolor: 'success.main',
                                        color: 'common.white',
                                        boxShadow: isDark
                                            ? '0 0 20px rgba(16, 185, 129, 0.4)'
                                            : '0 8px 16px rgba(16, 185, 129, 0.24)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        mx: 'auto', mb: 3
                                    }}
                                >
                                    <CheckCircle sx={{ fontSize: { xs: 36, md: 48 } }} />
                                </MotionBox>

                                <Typography variant="h4" fontWeight={800} gutterBottom color="text.primary" sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                                    Enrollment Complete!
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '80%', mx: 'auto', fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                    Thank you for your purchase. You now have full access to the course content.
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<DashboardIcon />}
                                        onClick={() => navigate('/dashboard')}
                                        sx={{ px: 4, py: 1.5, borderRadius: 2, width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Go to Dashboard
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<HomeIcon />}
                                        onClick={() => navigate('/')}
                                        sx={{ px: 4, py: 1.5, borderRadius: 2, width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Home
                                    </Button>
                                </Stack>
                            </MotionBox>
                        )}

                        {status === 'error' && (
                            <MotionBox
                                key="error"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <Box
                                    sx={{
                                        width: { xs: 60, md: 80 },
                                        height: { xs: 60, md: 80 },
                                        borderRadius: '50%',
                                        bgcolor: 'error.main',
                                        color: 'common.white',
                                        boxShadow: isDark
                                            ? '0 0 20px rgba(239, 68, 68, 0.4)'
                                            : '0 8px 16px rgba(239, 68, 68, 0.24)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        mx: 'auto', mb: 3
                                    }}
                                >
                                    <ErrorOutline sx={{ fontSize: { xs: 36, md: 48 } }} />
                                </Box>

                                <Typography variant="h5" fontWeight={700} gutterBottom color="error.main" sx={{ fontSize: { xs: '1.25rem', md: '1,5rem' } }}>
                                    Verification Failed
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 4 }}>
                                    {errorMessage}
                                </Typography>

                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <Button
                                        variant="outlined"
                                        onClick={() => window.location.reload()}
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        variant="text"
                                        onClick={() => navigate('/courses')}
                                    >
                                        Back to Courses
                                    </Button>
                                </Stack>
                            </MotionBox>
                        )}
                    </AnimatePresence>
                </MotionBox>
            </Container>
        </Box>
    );
}
