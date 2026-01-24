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
    CircularProgress,
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Check as CheckIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { databases, COLLECTIONS, DATABASE_ID, Query, ID } from '../../lib/appwrite';
import { VideoPlayer } from '../../components/course';

/**
 * Learn Page
 * 
 * MUI-based video player with lesson navigation sidebar.
 */
export function Learn() {
    const { courseId, lessonId } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth();

    // State
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;
            try {
                // 1. Fetch Course
                const courseDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.COURSES, courseId);

                // 2. Fetch Modules
                const modulesRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MODULES,
                    [Query.equal('courseId', courseId), Query.orderAsc('order')]
                );

                // 3. Fetch Lessons
                const moduleIds = modulesRes.documents.map(m => m.$id);
                let allLessons = [];
                if (moduleIds.length > 0) {
                    const lessonsRes = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.LESSONS,
                        [Query.equal('moduleId', moduleIds), Query.orderAsc('order')]
                    );
                    allLessons = lessonsRes.documents;
                }

                // 4. Fetch User Progress (if logged in)
                let progressIds = [];
                if (user) {
                    // Get all lesson IDs for this course
                    const lessonIds = allLessons.map(l => l.$id);
                    if (lessonIds.length > 0) {
                        const progressRes = await databases.listDocuments(
                            DATABASE_ID,
                            COLLECTIONS.PROGRESS,
                            [
                                Query.equal('userId', user.$id),
                                Query.equal('lessonId', lessonIds)
                            ]
                        );
                        progressIds = progressRes.documents.map(p => p.lessonId);
                    }
                }

                // Transform Data
                const fullModules = modulesRes.documents.map(m => ({
                    id: m.$id,
                    title: m.title,
                    lessons: allLessons.filter(l => l.moduleId === m.$id).map(l => ({
                        id: l.$id,
                        title: l.title,
                        youtubeUrl: l.youtubeUrl,
                        duration: l.duration ? `${l.duration}m` : '10:00'
                    }))
                }));

                setCourse({
                    id: courseDoc.$id,
                    title: courseDoc.title,
                    modules: fullModules
                });

                setCompletedLessons(progressIds);

            } catch (error) {
                console.error('Failed to load course:', error);
                toast.error('Could not load course content');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, user]);

    // Loading State
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    if (!course) return <Box sx={{ p: 4 }}>Course loading failed</Box>;

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

    const handleMarkComplete = async () => {
        if (!user) {
            toast.error('Please login to track progress');
            return;
        }

        if (completedLessons.includes(lessonId)) return;

        try {
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.PROGRESS,
                ID.unique(),
                {
                    userId: user.$id,
                    lessonId: lessonId,
                    completedAt: new Date().toISOString()
                }
            );

            setCompletedLessons(prev => [...prev, lessonId]);
            toast.success('Lesson completed!');
        } catch (error) {
            console.error('Failed to mark complete:', error);
            toast.error('Failed to save progress');
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
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            backgroundColor: 'background.paper'
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
                                    sx={{
                                        borderLeft: lesson.id === lessonId ? '4px solid' : '4px solid transparent',
                                        borderColor: 'primary.main',
                                        bgcolor: lesson.id === lessonId ? 'action.selected' : 'transparent',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 26 }}>
                                        {isLessonCompleted(lesson.id) ? (
                                            <CheckIcon color="success" fontSize="small" />
                                        ) : (
                                            <PlayIcon color="action" fontSize="small" />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={lesson.title}
                                        secondary={lesson.duration}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            fontWeight: lesson.id === lessonId ? 600 : 400
                                        }}
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
