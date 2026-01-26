import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Stack,
    Paper,
} from '@mui/material';
import {
    School as SchoolIcon,
    People as PeopleIcon,
    Add as AddIcon,
    TrendingUp as TrendingUpIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { databases, COLLECTIONS, DATABASE_ID, Query } from '../../lib/appwrite';

const MotionBox = motion.create(Box);

export function InstructorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState([
        { label: 'Active Courses', value: 0, icon: SchoolIcon, color: '#3b82f6' },
        { label: 'Total Students', value: 0, icon: PeopleIcon, color: '#10b981' },
        { label: 'Rating', value: '5.0', icon: StarIcon, color: '#f59e0b' },
        { label: 'Revenue', value: '$0', icon: TrendingUpIcon, color: '#8b5cf6' },
    ]);
    const [recentCourses, setRecentCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructorStats = async () => {
            if (!user) return;
            try {
                // Fetch Courses by Instructor
                const coursesRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.COURSES,
                    [
                        Query.equal('instructorId', user.$id),
                        Query.orderDesc('$createdAt'),
                        Query.limit(3)
                    ]
                );

                const myCourses = coursesRes.documents;

                // Update courses with real count
                const coursesWithStats = myCourses.map(c => ({
                    ...c,
                    studentsCount: c.studentsCount || 0
                }));

                const totalStudents = coursesWithStats.reduce((acc, course) => acc + (course.studentsCount || 0), 0);

                setStats([
                    { label: 'Active Courses', value: coursesRes.total, icon: SchoolIcon, color: '#3b82f6' },
                    { label: 'Total Students', value: totalStudents, icon: PeopleIcon, color: '#10b981' },
                    // { label: 'Avg Rating', value: '4.9', icon: StarIcon, color: '#f59e0b' }, // TODO: Implement V2
                    // { label: 'Revenue', value: '$0', icon: TrendingUpIcon, color: '#8b5cf6' }, // TODO: Implement V2
                ]);

                setRecentCourses(coursesWithStats);

            } catch (error) {
                console.error('Failed to load instructor stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructorStats();
    }, [user]);

    return (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="lg">
                {/* Header */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{ mb: 4 }}
                >
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                        Instructor Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Welcome back, Instructor {user?.name}! Here's how your courses are performing.
                    </Typography>
                </MotionBox>

                {/* Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {stats.map((stat, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
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

                {/* Quick Actions */}
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight={600}>
                                    Recent Courses
                                </Typography>
                                <Button component={Link} to="/admin/courses">
                                    View All
                                </Button>
                            </Box>
                            <Box sx={{ p: 0 }}>
                                {recentCourses.length > 0 ? (
                                    recentCourses.map((course) => (
                                        <Box
                                            key={course.$id}
                                            sx={{
                                                p: 2,
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                '&:last-child': { borderBottom: 0 },
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={600}>
                                                    {course.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {course.studentsCount || 0} Students • {course.category || 'General'}
                                                </Typography>
                                            </Box>
                                            <Button
                                                component={Link}
                                                to={`/admin/courses/${course.$id}/edit`}
                                                size="small"
                                                variant="outlined"
                                            >
                                                Edit
                                            </Button>
                                        </Box>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">No courses created yet.</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%', bgcolor: 'primary.main', color: 'white' }}>
                            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', height: '100%', justifyContent: 'center' }}>
                                <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                                    <AddIcon />
                                </Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    Create New Course
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                                    Ready to share your knowledge? Create a new course and reach students worldwide.
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/admin/courses/new"
                                    variant="contained"
                                    color="inherit"
                                    sx={{ color: 'primary.main', fontWeight: 600 }}
                                >
                                    Start Creating
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default InstructorDashboard;
