import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    IconButton,
    Card,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Drawer,
    Fab,
    Breadcrumbs,
    Stack,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Check as CheckIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { VideoPlayer } from '../../components/course';

/**
 * Learn Page
 * 
 * MUI-based video player with lesson navigation sidebar.
 */
export function Learn() {
    const { courseId, lessonId } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [completedLessons, setCompletedLessons] = useState(['l1']);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Demo course data (will be fetched from Appwrite later)
    const course = {
        id: courseId,
        title: 'Complete Web Development Bootcamp',
        modules: [
            {
                id: 'm1',
                title: 'Introduction to Web Development',
                lessons: [
                    { id: 'l1', title: 'What is Web Development?', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '10:00' },
                    { id: 'l2', title: 'Setting Up Your Environment', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '15:00' },
                    { id: 'l3', title: 'Course Overview', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '5:00' },
                ],
            },
            {
                id: 'm2',
                title: 'HTML Fundamentals',
                lessons: [
                    { id: 'l4', title: 'HTML Structure & Syntax', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '20:00' },
                    { id: 'l5', title: 'Working with Text', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '15:00' },
                    { id: 'l6', title: 'Links and Images', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '18:00' },
                ],
            },
            {
                id: 'm3',
                title: 'CSS Styling',
                lessons: [
                    { id: 'l7', title: 'CSS Basics', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '20:00' },
                    { id: 'l8', title: 'Flexbox Layout', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '30:00' },
                    { id: 'l9', title: 'CSS Grid', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '25:00' },
                ],
            },
        ],
    };

    // Find current lesson
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
    const currentLesson = allLessons[currentLessonIndex];
    const prevLesson = allLessons[currentLessonIndex - 1];
    const nextLesson = allLessons[currentLessonIndex + 1];

    // Find current module
    const currentModule = course.modules.find(m =>
        m.lessons.some(l => l.id === lessonId)
    );

    const handleMarkComplete = () => {
        if (!completedLessons.includes(lessonId)) {
            setCompletedLessons([...completedLessons, lessonId]);
            toast.success('Lesson marked as complete!');
        }
    };

    const isLessonCompleted = (id) => completedLessons.includes(id);

    // Sidebar content
    const sidebarContent = (
        <Box sx={{ width: 320, bgcolor: 'background.paper', height: '100%', overflow: 'auto' }}>
            {course.modules.map((module) => (
                <Box key={module.id}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            p: 2,
                            bgcolor: 'action.hover',
                            fontWeight: 600,
                        }}
                    >
                        {module.title}
                    </Typography>
                    <List disablePadding>
                        {module.lessons.map((lesson) => (
                            <ListItem key={lesson.id} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={`/learn/${courseId}/${lesson.id}`}
                                    selected={lesson.id === lessonId}
                                    onClick={() => isMobile && setSidebarOpen(false)}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {isLessonCompleted(lesson.id) ? (
                                            <CheckIcon color="success" fontSize="small" />
                                        ) : (
                                            <PlayIcon color="action" fontSize="small" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={lesson.title}
                                        secondary={lesson.duration}
                                        primaryTypographyProps={{ variant: 'body2' }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            ))}
        </Box>
    );

    if (!currentLesson) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                    gap: 2,
                }}
            >
                <Typography variant="h2">🔍</Typography>
                <Typography variant="h6">Lesson not found</Typography>
                <Button
                    component={Link}
                    to={`/courses/${courseId}`}
                    variant="contained"
                >
                    Back to Course
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Video Player */}
                <Box sx={{ bgcolor: 'background.paper', p: 2 }}>
                    <Container maxWidth="lg" disableGutters>
                        <VideoPlayer
                            youtubeUrl={currentLesson.youtubeUrl}
                            title={currentLesson.title}
                        />
                    </Container>
                </Box>

                {/* Lesson Info */}
                <Box sx={{ p: 3, flex: 1 }}>
                    <Container maxWidth="lg" disableGutters>
                        {/* Breadcrumb */}
                        <Breadcrumbs sx={{ mb: 2 }}>
                            <Typography
                                component={Link}
                                to={`/courses/${courseId}`}
                                color="primary"
                                sx={{ textDecoration: 'none' }}
                            >
                                {course.title}
                            </Typography>
                            <Typography color="text.secondary">
                                {currentModule?.title}
                            </Typography>
                        </Breadcrumbs>

                        {/* Title and Actions */}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={2}
                            sx={{ mb: 4 }}
                        >
                            <Box>
                                <Typography variant="h4" fontWeight={700} gutterBottom>
                                    {currentLesson.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Duration: {currentLesson.duration}
                                </Typography>
                            </Box>

                            <Button
                                variant={isLessonCompleted(lessonId) ? 'outlined' : 'contained'}
                                color={isLessonCompleted(lessonId) ? 'success' : 'primary'}
                                onClick={handleMarkComplete}
                                disabled={isLessonCompleted(lessonId)}
                                startIcon={<CheckIcon />}
                            >
                                {isLessonCompleted(lessonId) ? 'Completed' : 'Mark Complete'}
                            </Button>
                        </Stack>

                        {/* Navigation */}
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            sx={{ mt: 4 }}
                        >
                            {prevLesson ? (
                                <Button
                                    component={Link}
                                    to={`/learn/${courseId}/${prevLesson.id}`}
                                    variant="outlined"
                                    startIcon={<ChevronLeftIcon />}
                                >
                                    Previous
                                </Button>
                            ) : (
                                <Box />
                            )}

                            {nextLesson ? (
                                <Button
                                    component={Link}
                                    to={`/learn/${courseId}/${nextLesson.id}`}
                                    variant="contained"
                                    endIcon={<ChevronRightIcon />}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    component={Link}
                                    to="/dashboard"
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckIcon />}
                                >
                                    Finish Course
                                </Button>
                            )}
                        </Stack>
                    </Container>
                </Box>
            </Box>

            {/* Desktop Sidebar */}
            {!isMobile && sidebarOpen && (
                <Box
                    sx={{
                        width: 320,
                        borderLeft: 1,
                        borderColor: 'divider',
                        overflow: 'auto',
                    }}
                >
                    {sidebarContent}
                </Box>
            )}

            {/* Mobile Sidebar Drawer */}
            <Drawer
                anchor="right"
                open={isMobile && sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            >
                {sidebarContent}
            </Drawer>

            {/* Mobile FAB */}
            {isMobile && (
                <Fab
                    color="primary"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                    }}
                >
                    <MenuIcon />
                </Fab>
            )}
        </Box>
    );
}

export default Learn;
