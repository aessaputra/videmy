import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Chip,
    Grid,
    Card,
    CardMedia,
    Avatar,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    People as PeopleIcon,
    AccessTime as TimeIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { databases, COLLECTIONS, DATABASE_ID, Query, ID } from '../../lib/appwrite';

import { ErrorBoundary } from '../../components/common/ErrorBoundary';

// Motion wrapper
const MotionBox = motion.create(Box);

/**
 * Course Detail Page
 * 
 * MUI-based page showing course information, curriculum, and enrollment button.
 */
export function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [expanded, setExpanded] = useState('m1');

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // State
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                if (!id) return;

                // 1. Fetch Course
                const courseDoc = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.COURSES,
                    id
                );

                // 2. Fetch Modules
                const modulesRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MODULES,
                    [
                        Query.equal('courseId', id),
                        Query.orderAsc('order')
                    ]
                );

                // 3. Fetch Lessons
                const moduleIds = modulesRes.documents.map(m => m.$id);
                let allLessons = [];

                if (moduleIds.length > 0) {
                    const lessonsRes = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.LESSONS,
                        [
                            Query.equal('moduleId', moduleIds),
                            Query.orderAsc('order')
                        ]
                    );
                    allLessons = lessonsRes.documents;
                }

                // 4. Fetch User Progress (NEW)
                let completedLessonIds = [];
                if (user && allLessons.length > 0) {
                    try {
                        const progressRes = await databases.listDocuments(
                            DATABASE_ID,
                            COLLECTIONS.PROGRESS,
                            [
                                Query.equal('userId', user.$id),
                                Query.equal('lessonId', allLessons.map(l => l.$id))
                            ]
                        );
                        completedLessonIds = progressRes.documents.map(p => p.lessonId);
                    } catch (e) {
                        console.error('Failed to load progress:', e);
                        // Continue without progress if fail
                    }
                }

                // Stitch structure
                const fullModules = modulesRes.documents.map(m => ({
                    id: m.$id,
                    title: m.title,
                    lessons: allLessons
                        .filter(l => l.moduleId === m.$id)
                        .map(l => ({
                            id: l.$id,
                            title: l.title,
                            duration: l.duration ? `${l.duration}m` : 'Video',
                            completed: completedLessonIds.includes(l.$id) // Real progress
                        }))
                }));

                setCourse({
                    id: courseDoc.$id,
                    title: courseDoc.title,
                    description: courseDoc.description,
                    category: courseDoc.category || 'General',
                    thumbnail: courseDoc.thumbnail || 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=1200',
                    instructor: {
                        name: 'Videmy Instructor',
                        avatar: 'VI',
                    },
                    lessonsCount: allLessons.length,
                    studentsCount: courseDoc.studentsCount || 0,
                    duration: 'Self-paced',
                    isEnrolled: false,
                    modules: fullModules,
                });

            } catch (error) {
                console.error('Failed to load course:', error);
                toast.error('Could not load course details');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [id, user]); // Added user dependency

    // Check enrollment status - Moved to top level to comply with Rules of Hooks
    useEffect(() => {
        const checkEnrollment = async () => {
            // Internal safety check instead of conditional hook call
            if (!isAuthenticated || !course || !user) return;

            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.ENROLLMENTS,
                    [
                        Query.equal('userId', user.$id),
                        Query.equal('courseId', course.id)
                    ]
                );

                if (response.documents.length > 0) {
                    setCourse(prev => ({ ...prev, isEnrolled: true }));
                }
            } catch (error) {
                console.error('Failed to check enrollment:', error);
            }
        };

        checkEnrollment();
    }, [course?.id, user?.$id, isAuthenticated]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!course) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <Typography>Course not found</Typography>
            </Box>
        );
    }

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll in this course');
            navigate('/login');
            return;
        }

        try {
            // Double check enrollment
            if (course.isEnrolled) {
                return handleStartLearning();
            }

            const enrollment = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.ENROLLMENTS,
                ID.unique(),
                {
                    userId: user.$id,
                    courseId: course.id,
                    enrolledAt: new Date().toISOString()
                }
            );

            setCourse(prev => ({ ...prev, isEnrolled: true }));
            toast.success('Successfully enrolled!');
            handleStartLearning();

        } catch (error) {
            console.error('Enrollment failed:', error);
            toast.error('Failed to enroll. Please try again.');
        }
    };

    const handleStartLearning = () => {
        if (course?.modules?.[0]?.lessons?.[0]) {
            navigate(`/learn/${course.id}/${course.modules[0].lessons[0].id}`);
        } else {
            toast.error('Course has no lessons yet.');
        }
    };

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

    return (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="lg">
                {/* Course Header */}
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Chip label={course.category} color="primary" sx={{ mb: 2 }} />

                            <Typography variant="h3" fontWeight={700} gutterBottom>
                                {course.title}
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 3, lineHeight: 1.8 }}
                            >
                                {course.description}
                            </Typography>

                            {/* Course Stats */}
                            <Stack
                                direction="row"
                                spacing={3}
                                flexWrap="wrap"
                                useFlexGap
                                sx={{ mb: 3 }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <PlayIcon color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        {totalLessons} lessons
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <PeopleIcon color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        {course.studentsCount.toLocaleString()} students
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TimeIcon color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        {course.duration}
                                    </Typography>
                                </Stack>
                            </Stack>

                            {/* Instructor */}
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {course.instructor.avatar}
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Instructor
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {course.instructor.name}
                                    </Typography>
                                </Box>
                            </Stack>

                            {/* CTA */}
                            {course.isEnrolled ? (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleStartLearning}
                                    startIcon={<PlayIcon />}
                                >
                                    Continue Learning
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleEnroll}
                                    startIcon={<PlayIcon />}
                                >
                                    Enroll Now - Free
                                </Button>
                            )}
                        </MotionBox>
                    </Grid>

                    {/* Thumbnail */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <MotionBox
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                <CardMedia
                                    component="img"
                                    image={course.thumbnail}
                                    alt={course.title}
                                    sx={{ aspectRatio: '16/9' }}
                                />
                            </Card>
                        </MotionBox>
                    </Grid>
                </Grid>

                {/* Curriculum */}
                <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
                        Course Curriculum
                    </Typography>

                    {course.modules.map((module, index) => (
                        <Accordion
                            key={module.id}
                            expanded={expanded === module.id}
                            onChange={handleChange(module.id)}
                            sx={{ mb: 1 }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Module {index + 1}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {module.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {module.lessons.length} lessons
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <List disablePadding>
                                    {module.lessons.map((lesson) => (
                                        <ListItem
                                            key={lesson.id}
                                            divider
                                            sx={{ py: 1.5, px: 3 }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                {lesson.completed ? (
                                                    <CheckIcon color="success" />
                                                ) : (
                                                    <PlayIcon color="action" />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={lesson.title}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {lesson.duration}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}

export default function CourseDetailWithErrorBoundary() {
    return (
        <ErrorBoundary>
            <CourseDetail />
        </ErrorBoundary>
    );
}
