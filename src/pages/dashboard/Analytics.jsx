import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Stack } from '@mui/material';
import {
    Analytics as AnalyticsIcon,
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { databases, COLLECTIONS, DATABASE_ID, Query } from '../../lib/appwrite';

/**
 * Analytics Page
 * 
 * Admin dashboard with statistics and insights.
 * Currently showing placeholder with preview of upcoming features.
 */
export function Analytics() {
    const [stats, setStats] = useState([
        { label: 'Total Users', value: 0, icon: <PeopleIcon />, color: '#3b82f6' },
        { label: 'Total Courses', value: 0, icon: <SchoolIcon />, color: '#10b981' },
        { label: 'Active Enrollments', value: 0, icon: <SchoolIcon />, color: '#f59e0b' },
        { label: 'Growth Rate', value: 'N/A', icon: <TrendingUpIcon />, color: '#8b5cf6' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Parallel fetching for performance
                const [usersRes, coursesRes, enrollRes] = await Promise.all([
                    databases.listDocuments(DATABASE_ID, COLLECTIONS.USERS, [Query.limit(1)]), // We just need 'total'
                    databases.listDocuments(DATABASE_ID, COLLECTIONS.COURSES, [Query.limit(1)]),
                    databases.listDocuments(DATABASE_ID, COLLECTIONS.ENROLLMENTS, [Query.limit(1)])
                ]);

                setStats([
                    { label: 'Total Users', value: usersRes.total, icon: <PeopleIcon />, color: '#3b82f6' },
                    { label: 'Total Courses', value: coursesRes.total, icon: <SchoolIcon />, color: '#10b981' },
                    { label: 'Total Enrollments', value: enrollRes.total, icon: <AnalyticsIcon />, color: '#f59e0b' },
                    { label: 'Platform Status', value: 'Active', icon: <TrendingUpIcon />, color: '#8b5cf6' },
                ]);
            } catch (error) {
                console.error('Analytics load failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Real-time platform performance metrics.
            </Typography>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Paper
                            sx={{
                                p: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
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
                                {loading ? (
                                    <Typography variant="h5" fontWeight={700}>...</Typography>
                                ) : (
                                    <Typography variant="h5" fontWeight={700}>
                                        {stat.value}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                    {stat.label}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
                <Typography color="text.secondary">
                    More detailed charts and graphs coming in V2.
                </Typography>
            </Box>
        </Box>
    );
}

export default Analytics;


