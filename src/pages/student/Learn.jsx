import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    Divider,
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Check as CheckIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';
import videmyLogo from '../../assets/videmy-logo.png';
import { toast } from 'sonner';
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
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, isAuthenticated } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [accessDenied, setAccessDenied] = useState(false);

    // Reset sidebar state on screen resize
    useEffect(() => {
        if (!isMobile) {
            setSidebarOpen(true);
        } else {
            setSidebarOpen(false); // Optional: Auto-close on mobile when first loading/resizing
        }
    }, [isMobile]);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;

            // Access Control Check - MUST be logged in
            if (!isAuthenticated || !user) {
                toast.error('Please login to access course content');
                navigate('/login');
                return;
            }

            try {
                // 1. Fetch Course FIRST (needed for owner check)
                const courseDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.COURSES, courseId);

                // 2. ROLE-BASED ACCESS CONTROL
                // Best Practice: Owner/Admin can access without enrollment
                const isCourseOwner = courseDoc.instructorId === user.$id;
                const isAdmin = user.role === 'admin';

                // Check enrollment for non-owner/non-admin users
                let isEnrolled = false;
                if (!isCourseOwner && !isAdmin) {
                    const enrollmentRes = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.ENROLLMENTS,
                        [
                            Query.equal('userId', user.$id),
                            Query.equal('courseId', courseId)
                        ]
                    );
                    isEnrolled = enrollmentRes.documents.length > 0;

                    if (!isEnrolled) {
                        // Not enrolled, not owner, not admin - deny access
                        setAccessDenied(true);
                        setLoading(false);
                        return;
                    }
                }

                // 3. Fetch Modules (user has access)
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
    }, [courseId, user, isAuthenticated, navigate]);

    // Loading State
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    // Access Denied State - User not enrolled
    if (accessDenied) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 3,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'background.default'
                }}
            >
                <Typography variant="h1" sx={{ fontSize: '4rem' }}>🔒</Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                    Access Denied
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                    You need to enroll in this course to access the content.
                    Please enroll first to start learning.
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        to={`/courses/${courseId}`}
                    >
                        Enroll Now
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        component={Link}
                        to="/dashboard"
                    >
                        Back to Dashboard
                    </Button>
                </Stack>
            </Box>
        );
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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Custom Header for Learn Mode */}
            <Box sx={{ height: 64, borderBottom: 1, borderColor: 'divider', px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
                <Box
                    component={Link}
                    to="/dashboard"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        textDecoration: 'none',
                    }}
                >
                    <Box
                        component="img"
                        src={videmyLogo}
                        alt="Videmy Logo"
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            objectFit: 'contain',
                        }}
                    />
                    <Typography
                        variant="h6"
                        component="span"
                        color="primary"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: -0.5
                        }}
                    >
                        Videmy
                    </Typography>
                </Box>
                <Button component={Link} to={`/courses/${courseId}`} variant="outlined" size="small">
                    Course Overview
                </Button>
            </Box>

            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Main Content Area (Scrollable) */}
                <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

                    {/* Video Section (Black Background) */}
                    <Box sx={{ bgcolor: 'black', width: '100%', py: 2 }}>
                        <Container maxWidth="xl" sx={{ px: { xs: 0, md: 2 } }}>
                            <Box sx={{ maxWidth: '1280px', mx: 'auto' }}>
                                <VideoPlayer
                                    youtubeUrl={currentLesson.youtubeUrl}
                                    title={currentLesson.title}
                                />
                            </Box>
                        </Container>
                    </Box>

                    {/* Lesson Info & Navigation */}
                    <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
                        <Box sx={{ maxWidth: '1280px', mx: 'auto' }}>
                            {/* Breadcrumb & Navigation Row */}
                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                <Breadcrumbs>
                                    <Typography component={Link} to={`/courses/${courseId}`} color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                        {course.title}
                                    </Typography>
                                    <Typography color="text.primary" fontWeight={500}>
                                        {currentModule?.title}
                                    </Typography>
                                </Breadcrumbs>

                                {/* Desktop Navigation Buttons (Top) */}
                                {!isMobile && (
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            disabled={!prevLesson}
                                            component={prevLesson ? Link : 'button'}
                                            to={prevLesson ? `/learn/${courseId}/${prevLesson.id}` : '#'}
                                            variant="outlined"
                                            color="inherit"
                                            startIcon={<ChevronLeftIcon />}
                                            sx={{
                                                borderRadius: 8,
                                                px: 3,
                                                textTransform: 'none',
                                                borderColor: 'divider',
                                                '&:hover': {
                                                    borderColor: 'text.primary',
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            component={nextLesson ? Link : 'button'}
                                            to={nextLesson ? `/learn/${courseId}/${nextLesson.id}` : '/dashboard'}
                                            variant="contained"
                                            size="medium"
                                            endIcon={nextLesson ? <ChevronRightIcon /> : <CheckIcon />}
                                            color={nextLesson ? 'primary' : 'success'}
                                            disableElevation
                                            sx={{
                                                borderRadius: 8,
                                                px: 3,
                                                textTransform: 'none',
                                                fontWeight: 600
                                            }}
                                        >
                                            {nextLesson ? 'Next Lesson' : 'Finish Course'}
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>

                            <Divider sx={{ mb: 3 }} />

                            {/* Title & Actions */}
                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={3}>
                                <Box>
                                    <Typography variant="h4" fontWeight={700} gutterBottom>
                                        {currentLesson.title}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Duration: {currentLesson.duration}
                                    </Typography>
                                </Box>

                                <Button
                                    size="large"
                                    variant={isLessonCompleted(lessonId) ? 'outlined' : 'contained'}
                                    color={isLessonCompleted(lessonId) ? 'success' : 'primary'}
                                    onClick={handleMarkComplete}
                                    startIcon={<CheckIcon />}
                                    disableElevation
                                    sx={{
                                        minWidth: 180,
                                        borderRadius: 8,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.5
                                    }}
                                >
                                    {isLessonCompleted(lessonId) ? 'Completed' : 'Mark Complete'}
                                </Button>
                            </Stack>

                            {/* Mobile Navigation Buttons (Bottom) */}
                            {isMobile && (
                                <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 4 }}>
                                    <Button
                                        fullWidth
                                        disabled={!prevLesson}
                                        component={prevLesson ? Link : 'button'}
                                        to={prevLesson ? `/learn/${courseId}/${prevLesson.id}` : '#'}
                                        variant="outlined"
                                        startIcon={<ChevronLeftIcon />}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        fullWidth
                                        component={nextLesson ? Link : 'button'}
                                        to={nextLesson ? `/learn/${courseId}/${nextLesson.id}` : '/dashboard'}
                                        variant="contained"
                                        endIcon={nextLesson ? <ChevronRightIcon /> : <CheckIcon />}
                                        color={nextLesson ? 'primary' : 'success'}
                                    >
                                        {nextLesson ? 'Next' : 'Finish'}
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                    </Container>
                </Box>

                {/* Sidebar (Desktop) */}
                {!isMobile && sidebarOpen && (
                    <Box sx={{ width: 400, borderLeft: 1, borderColor: 'divider', overflowY: 'auto', bgcolor: 'background.paper' }}>
                        <Typography variant="h6" sx={{ p: 2, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, borderBottom: 1, borderColor: 'divider' }}>
                            Course Content
                        </Typography>
                        {sidebarContent}
                    </Box>
                )}
            </Box>

            {/* Mobile Sidebar Drawer */}
            <Drawer
                anchor="bottom"
                open={isMobile && sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                PaperProps={{ sx: { height: '60vh' } }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Course Content</Typography>
                    <Button onClick={() => setSidebarOpen(false)}>Close</Button>
                </Box>
                {sidebarContent}
            </Drawer>

            {/* Mobile FAB to toggler Sidebar */}
            {isMobile && (
                <Fab
                    color="primary"
                    aria-label="menu"
                    onClick={() => setSidebarOpen(true)}
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                >
                    <MenuIcon />
                </Fab>
            )}
        </Box>
    );
}

export default Learn;
