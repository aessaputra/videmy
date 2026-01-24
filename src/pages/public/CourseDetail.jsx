import { useState } from 'react';
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
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

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
    const { isAuthenticated } = useAuth();
    const [expanded, setExpanded] = useState('m1');

    // Demo course data (will be fetched from Appwrite later)
    const course = {
        id,
        title: 'Complete Web Development Bootcamp',
        description: 'Pelajari web development dari dasar hingga mahir. Kursus ini mencakup HTML, CSS, JavaScript, React, Node.js, dan database. Anda akan membangun beberapa proyek nyata dan siap untuk karir sebagai web developer.',
        category: 'Web Development',
        thumbnail: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=1200',
        instructor: {
            name: 'John Doe',
            avatar: 'JD',
        },
        lessonsCount: 120,
        studentsCount: 2500,
        duration: '40 hours',
        isEnrolled: false,
        modules: [
            {
                id: 'm1',
                title: 'Introduction to Web Development',
                lessons: [
                    { id: 'l1', title: 'What is Web Development?', duration: '10:00', completed: false },
                    { id: 'l2', title: 'Setting Up Your Environment', duration: '15:00', completed: false },
                    { id: 'l3', title: 'Course Overview', duration: '5:00', completed: false },
                ],
            },
            {
                id: 'm2',
                title: 'HTML Fundamentals',
                lessons: [
                    { id: 'l4', title: 'HTML Structure & Syntax', duration: '20:00', completed: false },
                    { id: 'l5', title: 'Working with Text', duration: '15:00', completed: false },
                    { id: 'l6', title: 'Links and Images', duration: '18:00', completed: false },
                    { id: 'l7', title: 'Forms and Inputs', duration: '25:00', completed: false },
                ],
            },
            {
                id: 'm3',
                title: 'CSS Styling',
                lessons: [
                    { id: 'l8', title: 'CSS Basics', duration: '20:00', completed: false },
                    { id: 'l9', title: 'Flexbox Layout', duration: '30:00', completed: false },
                    { id: 'l10', title: 'CSS Grid', duration: '25:00', completed: false },
                    { id: 'l11', title: 'Responsive Design', duration: '35:00', completed: false },
                ],
            },
        ],
    };

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleEnroll = () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll in this course');
            navigate('/login');
            return;
        }

        toast.success('Successfully enrolled!');
        navigate(`/learn/${course.id}/${course.modules[0].lessons[0].id}`);
    };

    const handleStartLearning = () => {
        navigate(`/learn/${course.id}/${course.modules[0].lessons[0].id}`);
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

export default CourseDetail;
