import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Pending Approval Page
 * 
 * Shown to users (instructors) who have signed up but are not yet approved by an admin.
 */
export function PendingApproval() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default'
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        borderRadius: 2
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: 'warning.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            color: 'warning.dark'
                        }}
                    >
                        <AccessTimeIcon sx={{ fontSize: 48 }} />
                    </Box>

                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Review in Progress
                    </Typography>

                    <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                        Thanks for signing up as an instructor, <strong>{user?.name}</strong>!
                        <br /><br />
                        Your account is currently under review by our administrators.
                        This process helps us ensure the highest quality of education on our platform.
                        <br /><br />
                        You will be able to access your dashboard once your account is approved.
                    </Typography>

                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleLogout}
                    >
                        Back to Home
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}

export default PendingApproval;
