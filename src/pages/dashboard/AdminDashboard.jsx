import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    SupervisorAccount as InstructorIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../../lib/appwrite';
import { toast } from 'sonner';

export function AdminDashboard() {
    const [stats, setStats] = useState([
        { label: 'Total Students', value: 0, icon: PeopleIcon, color: '#3b82f6' },
        { label: 'Total Courses', value: 0, icon: SchoolIcon, color: '#10b981' },
        { label: 'Total Instructors', value: 0, icon: InstructorIcon, color: '#f59e0b' },
    ]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Parallel fetch for performance
            const [studentsRes, coursesRes, instructorsRes] = await Promise.all([
                // Total Students (role = student)
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    [
                        Query.equal('role', 'student'),
                        Query.limit(1)
                    ]
                ),
                // Total Courses
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.COURSES,
                    [Query.limit(1)]
                ),
                // Total Instructors
                databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    [
                        Query.equal('role', 'instructor'),
                        Query.limit(1)
                    ]
                )
            ]);

            setStats([
                { label: 'Total Students', value: studentsRes.total, icon: PeopleIcon, color: '#3b82f6' },
                { label: 'Total Courses', value: coursesRes.total, icon: SchoolIcon, color: '#10b981' },
                { label: 'Total Instructors', value: instructorsRes.total, icon: InstructorIcon, color: '#f59e0b' },
            ]);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            toast.error('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Admin Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Platform Overview & Management
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchStats}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Stats Grid - Same style as InstructorDashboard */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {stats.map((stat, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: `${stat.color}15`,
                                        color: stat.color,
                                    }}
                                >
                                    <stat.icon />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight={700}>
                                        {loading ? <CircularProgress size={24} /> : stat.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

export default AdminDashboard;

