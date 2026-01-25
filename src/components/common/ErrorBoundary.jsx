import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Fallback Component
 * Displayed when an error occurs
 */
function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                }}
            >
                <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
                    Something went wrong
                </Typography>

                <Box sx={{ my: 2, bgcolor: 'grey.100', p: 2, borderRadius: 1, overflow: 'auto' }}>
                    <Typography variant="body2" color="error.main" fontFamily="monospace" textAlign="left">
                        {error.message}
                    </Typography>
                </Box>

                <Typography variant="body1" color="text.secondary" paragraph>
                    We apologize for the inconvenience. Please try refreshing the page.
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={resetErrorBoundary}
                    sx={{ mt: 2 }}
                >
                    Try Again
                </Button>
            </Paper>
        </Container>
    );
}

/**
 * Error Boundary Wrapper
 * Wraps children with error handling capabilities
 */
export function ErrorBoundary({ children, onReset }) {
    const logError = (error, info) => {
        // Log to console or external service
        console.error('Caught by ErrorBoundary:', error);
        console.error('Component Stack:', info.componentStack);
    };

    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={logError}
            onReset={onReset}
        >
            {children}
        </ReactErrorBoundary>
    );
}

export default ErrorBoundary;
