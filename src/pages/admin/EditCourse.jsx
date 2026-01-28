import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    TextField,
    Paper,
    Stack,
    MenuItem,
    FormControlLabel,
    Switch,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Breadcrumbs,
    Link,
    Grid,
    Card,
    CardContent,
    InputAdornment,
    Divider,
    Chip,
    Tabs,
    Tab,
    Alert
} from '@mui/material';
import {
    Save as SaveIcon,
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    PlayArrow as LessonIcon,
    NavigateNext as NavigateNextIcon,
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    ViewList as ViewListIcon,
    Settings as SettingsIcon,
    Info as InfoIcon,
    DragIndicator as DragIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AddLessonDialog } from '../../components/admin/AddLessonDialog';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { databases, COLLECTIONS, DATABASE_ID, ID, Query, Permission, Role } from '../../lib/appwrite';
import { ThumbnailUploader } from '../../components/admin/ThumbnailUploader';
import { DraggableModule } from '../../components/admin/DraggableModule';
import { formatDuration } from '../../lib/format';

// Zod validation schema (English)
const courseSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(1, 'Category is required'),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    isPublished: z.boolean(),
    thumbnail: z.string().optional(),
});

const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Design',
    'Business',
    'Marketing'
];

// Helper: Convert "MM:SS" or "MM" or "123" to seconds (integer)
const parseDuration = (input) => {
    if (!input) return 0;
    if (!isNaN(input)) return parseInt(input, 10);
    const parts = input.toString().split(':').map(p => parseInt(p, 10));
    if (parts.length === 2) return (parts[0] * 60) + parts[1];
    if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    return 0;
};



export function EditCourse() {
    const { id } = useParams();
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const confirm = useConfirm();

    // Loading States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState(0);

    // Data States (for modules & lessons)
    const [modules, setModules] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [instructorId, setInstructorId] = useState('');

    // React Hook Form setup
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            description: '',
            category: 'Web Development',
            price: 0,
            isPublished: false,
            thumbnail: '',
        }
    });

    const priceValue = watch('price');
    const isPublished = watch('isPublished');

    // Dialog States
    const [moduleDialog, setModuleDialog] = useState(false);
    const [lessonDialog, setLessonDialog] = useState(false);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    // Fetch course data and populate form
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const courseDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.COURSES, id);

                if (courseDoc.instructorId !== user?.$id && !hasRole(ROLES.ADMIN)) {
                    toast.error('Unauthorized access');
                    navigate('/admin/courses');
                    return;
                }

                setInstructorId(courseDoc.instructorId);

                // Reset form with fetched data
                reset({
                    title: courseDoc.title,
                    description: courseDoc.description,
                    category: courseDoc.category,
                    price: courseDoc.price,
                    isPublished: courseDoc.isPublished,
                    thumbnail: courseDoc.thumbnail || '',
                });

                // Fetch Modules
                const modulesRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MODULES,
                    [Query.equal('courseId', id), Query.orderAsc('order')]
                );
                setModules(modulesRes.documents);

                // Fetch Lessons
                if (modulesRes.documents.length > 0) {
                    const moduleIds = modulesRes.documents.map(m => m.$id);
                    const lessonsRes = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.LESSONS,
                        [Query.equal('moduleId', moduleIds), Query.limit(100)]
                    );
                    setLessons(lessonsRes.documents);
                }
            } catch (error) {
                console.error('Data load failed:', error);
                toast.error('Failed to load course data');
            } finally {
                setLoading(false);
            }
        };

        if (user && id) fetchCourseData();
    }, [id, user, navigate, reset]);

    // Sync lesson count on load
    useEffect(() => {
        if (!loading && lessons.length > 0 && lessons.length < 100) {
            const syncCount = async () => {
                try {
                    await databases.updateDocument(DATABASE_ID, COLLECTIONS.COURSES, id, { lessonsCount: lessons.length });
                } catch { /* ignore */ }
            };
            syncCount();
        }
    }, [loading, id, lessons.length]);

    // Save Course Details
    const onSubmit = async (data) => {
        setSaving(true);
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.COURSES, id, {
                title: data.title,
                description: data.description,
                category: data.category,
                price: data.price,
                isPublished: data.isPublished,
                thumbnail: data.thumbnail,
            });
            toast.success('Course details updated');
        } catch (error) {
            toast.error('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    // Module Handlers
    const handleAddModule = async () => {
        if (!newModuleTitle.trim()) return;
        try {
            const res = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.MODULES,
                ID.unique(),
                { title: newModuleTitle, courseId: id, order: modules.length },
                [Permission.read(Role.any()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]
            );
            setModules([...modules, res]);
            setModuleDialog(false);
            setNewModuleTitle('');
            toast.success('Module added successfully');
        } catch (error) {
            console.error('Add module failed:', error);
            toast.error('Failed to add module');
        }
    };

    const handleUpdateModule = async (moduleId, newTitle) => {
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.MODULES, moduleId, {
                title: newTitle
            });
            setModules(modules.map(m => 
                m.$id === moduleId ? { ...m, title: newTitle } : m
            ));
        } catch (error) {
            console.error('Update module failed:', error);
            throw error; // Re-throw to be handled by EditableModuleTitle
        }
    };

    const handleDeleteModule = async (moduleId) => {
        const confirmed = await confirm({
            title: 'Delete Module?',
            description: 'Are you sure you want to delete this module? All lessons within it will be removed from view. This action cannot be undone.',
            confirmationText: 'Delete',
            cancellationText: 'Cancel',
            confirmationButtonProps: { variant: 'contained', color: 'error', autoFocus: true },
        });

        if (!confirmed) return;

        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MODULES, moduleId);
            setModules(modules.filter(m => m.$id !== moduleId));
            setLessons(lessons.filter(l => l.moduleId !== moduleId));
            toast.success('Module deleted successfully');
        } catch (error) {
            console.error('Delete module failed:', error);
            toast.error('Failed to delete module');
        }
    };

    const handleDuplicateModule = async (module) => {
        try {
            const duplicatedModule = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.MODULES,
                ID.unique(),
                { 
                    title: `${module.title} (Copy)`, 
                    courseId: id, 
                    order: modules.length 
                },
                [Permission.read(Role.any()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]
            );
            setModules([...modules, duplicatedModule]);
            toast.success('Module duplicated successfully');
        } catch (error) {
            console.error('Duplicate module failed:', error);
            toast.error('Failed to duplicate module');
        }
    };

    const handleMoveModule = async (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= modules.length) return;
        
        const newModules = [...modules];
        const [movedModule] = newModules.splice(fromIndex, 1);
        newModules.splice(toIndex, 0, movedModule);
        
        // Update local state immediately for better UX
        setModules(newModules);
        
        try {
            // Update order in database
            const updatePromises = newModules.map((module, index) =>
                databases.updateDocument(DATABASE_ID, COLLECTIONS.MODULES, module.$id, {
                    order: index
                })
            );
            await Promise.all(updatePromises);
            toast.success('Module order updated');
        } catch (error) {
            console.error('Move module failed:', error);
            toast.error('Failed to update module order');
            // Revert on error
            setModules(modules);
        }
    };

    // Lesson Handlers
    const openAddLesson = (moduleId) => {
        setSelectedModuleId(moduleId);
        setLessonDialog(true);
    };

    const handleAddLesson = async (lessonData) => {
        try {
            const res = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.LESSONS,
                ID.unique(),
                {
                    title: lessonData.title,
                    youtubeUrl: lessonData.youtubeUrl,
                    duration: lessonData.duration,
                    moduleId: lessonData.moduleId,
                    order: lessons.filter(l => l.moduleId === lessonData.moduleId).length,
                    content: lessonData.content || ''
                },
                [Permission.read(Role.any()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]
            );
            setLessons(prev => [...prev, res]);
            setLessonDialog(false);
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.COURSES, id, { lessonsCount: lessons.length + 1 });
        } catch (error) {
            console.error('Add lesson failed:', error);
            throw error; // Re-throw to let AddLessonDialog handle the error
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        const confirmed = await confirm({
            title: 'Delete Lesson?',
            description: 'Are you sure you want to delete this lesson? This action cannot be undone.',
            confirmationText: 'Delete',
            cancellationText: 'Cancel',
            confirmationButtonProps: { variant: 'contained', color: 'error', autoFocus: true },
        });

        if (!confirmed) return;

        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LESSONS, lessonId);
            setLessons(lessons.filter(l => l.$id !== lessonId));
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.COURSES, id, { lessonsCount: Math.max(0, lessons.length - 1) });
            toast.success('Lesson deleted');
        } catch {
            toast.error('Failed to delete lesson');
        }
    };

    const handleUpdateLesson = async (lessonId, updatedData) => {
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.LESSONS, lessonId, updatedData);
            setLessons(lessons.map(l => 
                l.$id === lessonId ? { ...l, ...updatedData } : l
            ));
            toast.success('Lesson updated successfully');
        } catch (error) {
            console.error('Update lesson failed:', error);
            toast.error('Failed to update lesson');
            throw error; // Re-throw to be handled by EditableLessonTitle
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        
        if (source.index === destination.index) return;

        // Reorder modules
        const newModules = Array.from(modules);
        const [reorderedModule] = newModules.splice(source.index, 1);
        newModules.splice(destination.index, 0, reorderedModule);

        // Update local state immediately for better UX
        setModules(newModules);

        // Update order in database
        const updatePromises = newModules.map((module, index) =>
            databases.updateDocument(DATABASE_ID, COLLECTIONS.MODULES, module.$id, {
                order: index
            })
        );

        Promise.all(updatePromises)
            .then(() => {
                toast.success('Module order updated');
            })
            .catch((error) => {
                console.error('Drag reorder failed:', error);
                toast.error('Failed to update module order');
                // Revert on error
                setModules(modules);
            });
    };

    const handleDeleteCourse = async () => {
        if (!confirm('Are you definitely sure? This action is irreversible.')) return;
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COURSES, id);
            toast.success('Course deleted');
            navigate('/admin/courses');
        } catch (e) {
            toast.error('Failed to delete course');
        }
    };

    if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', minHeight: '80vh', alignItems: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link component={RouterLink} to="/dashboard" color="inherit" underline="hover">Dashboard</Link>
                    <Link component={RouterLink} to="/admin/courses" color="inherit" underline="hover">Courses</Link>
                    <Typography color="text.primary">Edit Course</Typography>
                </Breadcrumbs>

                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="h4" fontWeight={700}>Editor</Typography>
                            <Chip
                                label={isPublished ? "Published" : "Draft"}
                                color={isPublished ? "success" : "warning"}
                                variant="outlined"
                                size="small"
                            />
                        </Stack>
                    </Box>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/courses')}>
                        All Courses
                    </Button>
                </Stack>

                {/* TABS HEADER */}
                <Paper elevation={0} variant="outlined" sx={{ mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab icon={<ViewListIcon />} iconPosition="start" label="Curriculum" />
                        <Tab icon={<InfoIcon />} iconPosition="start" label="Details" />
                        <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
                    </Tabs>
                </Paper>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* ===== TAB 0: CURRICULUM ===== */}
                    <Box role="tabpanel" hidden={activeTab !== 0} sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, px: 1 }}>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>Course Structure</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {modules.length} Modules • {lessons.length} Lessons
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setModuleDialog(true)}
                                sx={{ borderRadius: 2 }}
                            >
                                Add Module
                            </Button>
                        </Stack>

                        {modules.length === 0 ? (
                            <Paper sx={{ p: 8, textAlign: 'center', bgcolor: 'background.paper', borderStyle: 'dashed' }} variant="outlined">
                                <Typography variant="h6" color="text.secondary" gutterBottom>It's empty here</Typography>
                                <Typography color="text.secondary" paragraph>Start by adding your first module to organize content.</Typography>
                                <Button variant="outlined" onClick={() => setModuleDialog(true)} startIcon={<AddIcon />}>Create Module</Button>
                            </Paper>
                        ) : (
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="modules-list">
                                    {(provided) => (
                                        <Stack 
                                            spacing={3}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {modules.map((module, index) => (
                                                <DraggableModule
                                                    key={module.$id}
                                                    module={module}
                                                    index={index}
                                                    lessons={lessons}
                                                    onUpdateModule={handleUpdateModule}
                                                    onDeleteModule={handleDeleteModule}
                                                    onDuplicateModule={handleDuplicateModule}
                                                    onMoveModule={handleMoveModule}
                                                    onAddLesson={openAddLesson}
                                                    onUpdateLesson={handleUpdateLesson}
                                                    onDeleteLesson={handleDeleteLesson}
                                                    canMoveUp={index > 0}
                                                    canMoveDown={index < modules.length - 1}
                                                />
                                            ))}
                                            {provided.placeholder}
                                        </Stack>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </Box>

                    {/* ===== TAB 1: DETAILS ===== */}
                    <Box role="tabpanel" hidden={activeTab !== 1} sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
                        <Card variant="outlined">
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={3} maxWidth="md">
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Course Title"
                                                required
                                                fullWidth
                                                error={!!errors.title}
                                                helperText={errors.title?.message}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Description"
                                                required
                                                multiline
                                                rows={6}
                                                fullWidth
                                                error={!!errors.description}
                                                helperText={errors.description?.message}
                                            />
                                        )}
                                    />
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Controller
                                                name="category"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField
                                                        {...field}
                                                        select
                                                        label="Category"
                                                        required
                                                        fullWidth
                                                    >
                                                        {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                                    </TextField>
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Button size="large" variant="contained" type="submit" startIcon={<SaveIcon />} sx={{ alignSelf: 'flex-start', px: 4 }}>
                                        Save Details
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* ===== TAB 2: SETTINGS ===== */}
                    <Box role="tabpanel" hidden={activeTab !== 2} sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
                        <Stack spacing={4} maxWidth="md">
                            <Card variant="outlined">
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>Course Configuration</Typography>

                                    {/* Pricing Section */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>Pricing</Typography>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
                                            <TextField
                                                select
                                                label="Course Type"
                                                value={priceValue > 0 ? 'paid' : 'free'}
                                                onChange={(e) => setValue('price', e.target.value === 'paid' ? 50000 : 0)}
                                                fullWidth
                                                sx={{ maxWidth: { sm: 200 } }}
                                            >
                                                <MenuItem value="free">Free</MenuItem>
                                                <MenuItem value="paid">Paid</MenuItem>
                                            </TextField>

                                            {priceValue > 0 && (
                                                <Controller
                                                    name="price"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            label="Price amount"
                                                            type="number"
                                                            InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
                                                            fullWidth
                                                            sx={{ maxWidth: { sm: 200 } }}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </Stack>
                                    </Box>

                                    <Divider sx={{ mb: 4 }} />

                                    {/* Visibility Section */}
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Visibility</Typography>
                                        <Controller
                                            name="isPublished"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControlLabel
                                                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="success" />}
                                                    label={field.value ? "Published (Visible to students)" : "Draft (Hidden)"}
                                                    sx={{ mt: 1 }}
                                                />
                                            )}
                                        />
                                    </Box>

                                    <Box mt={3} display="flex" justifyContent="flex-end">
                                        <Button variant="contained" onClick={handleSubmit(onSubmit)}>Save Changes</Button>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Card variant="outlined">
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>Course Thumbnail</Typography>
                                    <Box sx={{ width: '100%', maxWidth: 400, mt: 2 }}>
                                        <Controller
                                            name="thumbnail"
                                            control={control}
                                            render={({ field }) => (
                                                <ThumbnailUploader
                                                    initialValue={field.value}
                                                    onChange={(url) => {
                                                        field.onChange(url);
                                                    }}
                                                    user={user}
                                                />
                                            )}
                                        />
                                    </Box>
                                    <Button sx={{ mt: 2 }} variant="contained" size="small" onClick={handleSubmit(onSubmit)}>Save Media</Button>
                                </CardContent>
                            </Card>

                            <Card variant="outlined" sx={{ borderColor: 'error.main', bgcolor: 'error.lighter' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" color="error" gutterBottom>Danger Zone</Typography>
                                    <Typography variant="body2" paragraph>
                                        Deleting this course will remove all modules and lessons permanently.
                                        This action cannot be undone.
                                    </Typography>
                                    <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteCourse}>
                                        Delete Course
                                    </Button>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Box>

                </form>

                {/* Dialogs */}
                <Dialog open={moduleDialog} onClose={() => setModuleDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Add New Module</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Module Title"
                            fullWidth
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setModuleDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddModule} variant="contained">Add Module</Button>
                    </DialogActions>
                </Dialog>

                <AddLessonDialog
                    open={lessonDialog}
                    onClose={() => setLessonDialog(false)}
                    moduleId={selectedModuleId}
                    onSave={handleAddLesson}
                />
            </Container>
        </Box>
    );
}

export default EditCourse;
