import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading Component
 * 
 * MUI-based loading spinner with optional message.
 * 
 * @param {Object} props
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.fullScreen - Whether to show fullscreen
 */
export function Loading({ message = 'Loading...', fullScreen = false }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                p: 4,
                ...(fullScreen && {
                    position: 'fixed',
                    inset: 0,
                    bgcolor: 'background.default',
                    zIndex: 9999,
                }),
            }}
        >
            <CircularProgress color="primary" />
            {message && (
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            )}
        </Box>
    );
}

export default Loading;
