import { Box, Typography, Grid, Paper, Stack } from '@mui/material';
import {
    Analytics as AnalyticsIcon,
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { ComingSoon } from '../../components/common/ComingSoon';

/**
 * Analytics Page
 * 
 * Admin dashboard with statistics and insights.
 * Currently showing placeholder with preview of upcoming features.
 */
export function Analytics() {
    // Placeholder stats for visual preview
    const previewStats = [
        { label: 'Total Users', value: '—', icon: <PeopleIcon />, color: '#3b82f6' },
        { label: 'Total Courses', value: '—', icon: <SchoolIcon />, color: '#10b981' },
        { label: 'Total Revenue', value: '—', icon: <MoneyIcon />, color: '#f59e0b' },
        { label: 'Growth Rate', value: '—', icon: <TrendingUpIcon />, color: '#8b5cf6' },
    ];

    return (
        <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Track your platform performance, user engagement, and revenue.
            </Typography>

            {/* Preview Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {previewStats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                            sx={{
                                p: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                opacity: 0.6,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: stat.color,
                                    color: 'white',
                                }}
                            >
                                {stat.icon}
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight={700}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.label}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Coming Soon Message */}
            <ComingSoon
                title="Analytics Coming Soon"
                description="We're building powerful analytics tools to help you understand your platform's performance, track student engagement, and grow your business."
                icon={<AnalyticsIcon />}
                showBackButton={true}
                backTo="/dashboard"
            />
        </Box>
    );
}

export default Analytics;
