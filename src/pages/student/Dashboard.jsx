import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    LinearProgress,
    Stack,
    Chip,
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    School as SchoolIcon,
    CheckCircle as CheckIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import { motion as MotionLibrary } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { databases, COLLECTIONS, DATABASE_ID, Query } from '../../lib/appwrite';

// Motion wrapper
const MotionBox = MotionLibrary.create(Box);
const MotionCard = MotionLibrary.create(Card);

/**
 * Dashboard Page
 * 
 * MUI-based student dashboard showing enrolled courses and progress.
 */
export function Dashboard() {
    const { user, hasRole, ROLES } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: 'Enrolled Courses', value: 0, icon: SchoolIcon, color: 'primary.main' },
        { label: 'Completed Lessons', value: 0, icon: CheckIcon, color: 'success.main' },
        { label: 'Hours Learned', value: '0', icon: TimeIcon, color: 'warning.main' }, // Placeholder
        { label: 'Avg Progress', value: '0%', icon: PlayIcon, color: 'info.main' },
    ]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // 1. Fetch Enrollments
                const enrollRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.ENROLLMENTS,
                    [Query.equal('userId', user.$id)]
                );

                if (enrollRes.documents.length === 0) {
                    setLoading(false);
                    return;
                }

                const courseIds = enrollRes.documents.map(e => e.courseId);

                // 2. Fetch Courses
                const coursesRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.COURSES,
                    [Query.equal('$id', courseIds)]
                );

                // 3. Fetch Modules (to get lessons)
                const modulesRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MODULES,
                    [Query.equal('courseId', courseIds)]
                );

                // 4. Fetch Lessons
                const moduleIds = modulesRes.documents.map(m => m.$id);
                // Note: If too many modules, this might hit query limit. Splitting is better in prod.
                const lessonsRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.LESSONS,
                    [
                        Query.equal('moduleId', moduleIds),
                        Query.limit(100) // Max limit might need pagination loop for real app
                    ]
                );
                const allLessons = lessonsRes.documents;

                // 5. Fetch User Progress
                const progressRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.PROGRESS,
                    [Query.equal('userId', user.$id)]
                );
                const completedLessonIds = progressRes.documents.map(p => p.lessonId);

                // 6. Calculate Stats & Map Data
                const mappedCourses = coursesRes.documents.map(course => {
                    // Find lessons for this course
                    const courseModuleIds = modulesRes.documents
                        .filter(m => m.courseId === course.$id)
                        .map(m => m.$id);

                    const courseLessons = allLessons
                        .filter(l => courseModuleIds.includes(l.moduleId));

                    const completedCount = courseLessons
                        .filter(l => completedLessonIds.includes(l.$id))
                        .length;

                    const totalLessons = courseLessons.length || course.lessonsCount || 0;
                    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

                    // Find last active lesson or first lesson
                    // Simple logic: First incomplete lesson
                    const firstIncomplete = courseLessons.find(l => !completedLessonIds.includes(l.$id));
                    const lastLesson = firstIncomplete || courseLessons[0] || { id: null, title: 'No lessons' };

                    return {
                        id: course.$id,
                        title: course.title,
                        thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800',
                        progress,
                        completedLessons: completedCount,
                        totalLessons,
                        lastLesson: { id: lastLesson.$id || lastLesson.id, title: lastLesson.title }
                    };
                });

                setEnrolledCourses(mappedCourses);

                // Update Stats
                const totalCompleted = completedLessonIds.length;
                const avgProgress = mappedCourses.length > 0
                    ? Math.round(mappedCourses.reduce((acc, c) => acc + c.progress, 0) / mappedCourses.length)
                    : 0;

                setStats([
                    { label: 'Enrolled Courses', value: mappedCourses.length, icon: SchoolIcon, color: 'primary.main' },
                    { label: 'Completed Lessons', value: totalCompleted, icon: CheckIcon, color: 'success.main' },
                    { label: 'Hours Learned', value: '12+', icon: TimeIcon, color: 'warning.main' },
                    { label: 'Avg Progress', value: `${avgProgress}%`, icon: PlayIcon, color: 'info.main' },
                ]);

            } catch (error) {
                console.error('Dashboard load failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
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
                        Welcome back, {user?.name || 'Student'}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {hasRole(ROLES.INSTRUCTOR)
                            ? 'Manage your courses and track student progress'
                            : 'Continue your learning journey'}
                    </Typography>
                </MotionBox>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {stats.map((stat, index) => (
                        <Grid key={index} size={{ xs: 6, md: 3 }}>
                            <MotionCard
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                sx={{ '&:hover': { transform: 'none' } }}
                            >
                                <CardContent>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                        <stat.icon sx={{ color: stat.color, fontSize: 20 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {stat.label}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h4" fontWeight={700}>
                                        {stat.value}
                                    </Typography>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </Grid>

                {/* Quick Actions for Instructor/Admin */}
                {hasRole([ROLES.INSTRUCTOR, ROLES.ADMIN]) && (
                    <Card sx={{ mb: 4, p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Quick Actions
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                component={Link}
                                to="/admin/courses"
                                variant="contained"
                                startIcon={<SchoolIcon />}
                            >
                                Manage Courses
                            </Button>
                            <Button
                                component={Link}
                                to="/admin/courses/new"
                                variant="outlined"
                            >
                                Create New Course
                            </Button>
                        </Stack>
                    </Card>
                )}

                {/* My Courses */}
                <Box>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 3 }}
                    >
                        <Typography variant="h5" fontWeight={600}>
                            My Courses
                        </Typography>
                        <Button
                            component={Link}
                            to="/courses"
                            variant="text"
                        >
                            Browse More
                        </Button>
                    </Stack>

                    {enrolledCourses.length > 0 ? (
                        <Grid container spacing={3}>
                            {enrolledCourses.map((course, index) => (
                                <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <MotionCard
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + index * 0.1 }}
                                        sx={{ height: '100%' }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <CardMedia
                                                component="img"
                                                height="160"
                                                image={course.thumbnail}
                                                alt={course.title}
                                            />
                                            <LinearProgress
                                                variant="determinate"
                                                value={course.progress}
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: 4,
                                                }}
                                            />
                                        </Box>

                                        <CardContent>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={600}
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    mb: 1,
                                                    minHeight: 48,
                                                }}
                                            >
                                                {course.title}
                                            </Typography>

                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                sx={{ mb: 1 }}
                                            >
                                                <Typography variant="body2" color="text.secondary">
                                                    {course.completedLessons} / {course.totalLessons} lessons
                                                </Typography>
                                                <Chip
                                                    label={`${course.progress}%`}
                                                    size="small"
                                                    color="primary"
                                                />
                                            </Stack>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block"
                                                sx={{ mb: 2 }}
                                            >
                                                Last: {course.lastLesson.title}
                                            </Typography>

                                            <Button
                                                component={Link}
                                                to={`/learn/${course.id}/${course.lastLesson.id}`}
                                                variant="contained"
                                                fullWidth
                                                startIcon={<PlayIcon />}
                                            >
                                                Continue
                                            </Button>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h2" sx={{ mb: 2 }}>📚</Typography>
                                <Typography variant="h6" gutterBottom>
                                    No courses yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    You haven't enrolled in any courses. Start learning today!
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/courses"
                                    variant="contained"
                                >
                                    Browse Courses
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </Container>
        </Box>
    );
}

export default Dashboard;
