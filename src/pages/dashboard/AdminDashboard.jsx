import { Box, Container, Typography, Button } from '@mui/material';
import { Analytics } from './Analytics';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
    return (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Admin Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            System Overview and Management
                        </Typography>
                    </Box>
                    <Button component={Link} to="/admin/users" variant="outlined">
                        Manage Users
                    </Button>
                </Box>

                {/* Reuse Analytics Content */}
                <Analytics />
            </Container>
        </Box>
    );
}

export default AdminDashboard;
