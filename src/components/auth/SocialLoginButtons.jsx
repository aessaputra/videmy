import { Box, Button } from '@mui/material';
import { Facebook as FacebookIcon } from '@mui/icons-material';
import { toast } from 'sonner';

/**
 * SocialLoginButtons Component
 * 
 * Renders Google and Facebook login buttons with consistent styling.
 * Used in both Login and Register pages.
 * 
 * @param {Function} onGoogleClick - Optional override for Google click
 * @param {Function} onFacebookClick - Optional override for Facebook click
 */
export default function SocialLoginButtons({ onGoogleClick, onFacebookClick }) {

    // Default handlers if none provided (Future: Integrate with AuthContext)
    const handleGoogle = () => {
        if (onGoogleClick) return onGoogleClick();
        toast.info('Google login feature coming soon!');
    };

    const handleFacebook = () => {
        if (onFacebookClick) return onFacebookClick();
        toast.info('Facebook login feature coming soon!');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogle}
                startIcon={
                    <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: 8, display: 'block' }}>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                }
                sx={{
                    color: 'text.primary',
                    borderColor: 'divider',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                        borderColor: 'text.primary',
                        bgcolor: 'action.hover',
                    }
                }}
            >
                Sign in with Google
            </Button>
            <Button
                fullWidth
                variant="outlined"
                onClick={handleFacebook}
                startIcon={<FacebookIcon sx={{ color: '#1877F2' }} />}
                sx={{
                    color: 'text.primary',
                    borderColor: 'divider',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                        borderColor: 'text.primary',
                        bgcolor: 'action.hover',
                    }
                }}
            >
                Sign in with Facebook
            </Button>
        </Box>
    );
}
