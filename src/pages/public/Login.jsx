import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import SignInCard from '../../components/auth/SignInCard';
import Content from '../../components/auth/Content';

export function Login() {
    return (
        <Box component="main" sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <CssBaseline enableColorScheme />

            {/* Left Side - Image/Content (30%) */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: { md: '30%' },
                    flexBasis: { md: '30%' },
                    maxWidth: { md: '30%' },
                    height: '100%',
                }}
            >
                <Content />
            </Box>

            {/* Right Side - Login Form (70%) */}
            <Box
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
                    overflow: 'hidden', // Fix: Outer container hides overflow
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
                        alignItems: 'center', // Center content horizontally
                        justifyContent: 'center', // Center content vertically
                        p: { xs: 2, md: 8 },
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: { xs: '480px', md: '600px' } }}>
                        <SignInCard />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Login;
