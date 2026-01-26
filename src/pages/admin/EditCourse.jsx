import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Divider,
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
} from '@mui/material';
import {
    Save as SaveIcon,
    ExpandMore as ExpandMoreIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    PlayArrow as LessonIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { databases, COLLECTIONS, DATABASE_ID, ID, Query, Permission, Role } from '../../lib/appwrite';
import { ThumbnailUploader } from '../../components/admin/ThumbnailUploader';

// Helper: Convert "MM:SS" or "MM" or "123" to seconds (integer)
const parseDuration = (input) => {
    if (!input) return 0;
    // If it's already a number or numeric string
    if (!isNaN(input)) return parseInt(input, 10);

    // Split by colon
    const parts = input.toString().split(':').map(p => parseInt(p, 10));
    if (parts.length === 2) {
        // MM:SS
        return (parts[0] * 60) + parts[1];
    } else if (parts.length === 3) {
        // HH:MM:SS
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }
    return 0; // Fallback
};

export function EditCourse() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Loading States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data States
    const [modules, setModules] = useState([]);
    const [lessons, setLessons] = useState([]); // Flat list of all lessons

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: 0,
        isPublished: false,
        thumbnail: '',
        instructorId: '',
    });

    const categories = ['Web Development', 'Mobile Development', 'Data Science', 'Design', 'Business', 'Marketing'];

    // Dialog States
    const [moduleDialog, setModuleDialog] = useState(false);
    const [lessonDialog, setLessonDialog] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [newLessonData, setNewLessonData] = useState({ title: '', youtubeUrl: '', duration: '', moduleId: '' });

    // ...

    // --- Handlers: Lessons ---
    const openAddLesson = (moduleId) => {
        setNewLessonData({ title: '', youtubeUrl: '', duration: '', moduleId });
        setLessonDialog(true);
    };

    const handleAddLesson = async () => {
        if (!newLessonData.title || !newLessonData.moduleId) return;
        try {
            const res = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.LESSONS,
                ID.unique(),
                {
                    title: newLessonData.title,
                    youtubeUrl: newLessonData.youtubeUrl, // Schema expects youtubeUrl
                    duration: parseDuration(newLessonData.duration),
                    moduleId: newLessonData.moduleId,
                    duration: parseDuration(newLessonData.duration),
                    moduleId: newLessonData.moduleId,
                    order: lessons.filter(l => l.moduleId === newLessonData.moduleId).length,
                    content: '', // Default content
                    isFree: false // Default locked
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            );
            setLessons(prev => [...prev, res]); // Functional update for safety
            setLessonDialog(false);

            // Update Course Lesson Count
            // We use lessons.length + 1 because 'lessons' in this scope is the OLD state
            const newCount = lessons.length + 1;
            console.log(`[AddLesson] Updating count to: ${newCount}`);

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.COURSES,
                id,
                { lessonsCount: newCount }
            );

            toast.success('Lesson added');
        } catch (error) {
            console.error('[AddLesson] Error:', error);
            toast.error('Failed to add lesson');
        }
    };

    // ...


    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // 1. Fetch Course
                const courseDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.COURSES, id);

                if (courseDoc.instructorId !== user?.$id) {
                    toast.error('Unauthorized');
                    navigate('/admin/courses');
                    return;
                }

                setFormData({
                    title: courseDoc.title,
                    description: courseDoc.description,
                    category: courseDoc.category,
                    price: courseDoc.price,
                    isPublished: courseDoc.isPublished,
                    thumbnail: courseDoc.thumbnail || '',
                    instructorId: courseDoc.instructorId
                });

                // 2. Fetch Modules
                const modulesRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.MODULES,
                    [Query.equal('courseId', id), Query.orderAsc('order')]
                );
                setModules(modulesRes.documents);

                // 3. Fetch Lessons (if modules exist)
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
    }, [id, user, navigate]);

    // Self-Healing Effect: Sync Lesson Count if mismatched
    useEffect(() => {
        if (!loading && lessons.length > 0) {
            // We need to check against the Initial loaded count, but that might be stale.
            // Simplified check: If we have lessons loaded, trigger a check against DB or just blind update?
            // Safer: Just update the count if we are sure we have ALL lessons.
            // Since we fetched ALL lessons (limit 100 in previous step), we can verify.

            // To be safe, we only do this if we are confident we have the full list.
            // The limit was 100. If we have 100 lessons, we might be missing some, so don't auto-update.
            if (lessons.length < 100) {
                // We can't easily read the "old" count from state without causing loops or complex refs.
                // Instead, we just ensure the DB is efficient by only updating if reasonable.
                // Actually, a better place is inside the fetch finally block or a specific sync function.
                // Let's rely on the user actions (Add/Delete) which are already consistent.
                // BUT, to fix existing bad data:

                const syncCount = async () => {
                    try {
                        // We don't have the 'original' doc count readily available in this scope easily 
                        // unless we store it. Let's assume if we are editing, we want truth.
                        await databases.updateDocument(
                            DATABASE_ID,
                            COLLECTIONS.COURSES,
                            id,
                            { lessonsCount: lessons.length }
                        );
                    } catch (e) {
                        // ignore
                    }
                };
                syncCount();
            }
        }
    }, [loading, id]); // Only run once on load completion

    // --- Handlers: Course ---
    const handleCourseChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await databases.updateDocument(DATABASE_ID, COLLECTIONS.COURSES, id, {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                price: parseFloat(formData.price) || 0,
                isPublished: formData.isPublished,
                thumbnail: formData.thumbnail,
            });
            toast.success('Course details saved');
        } catch (error) {
            toast.error('Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    // --- Handlers: Modules ---
    const handleAddModule = async () => {
        if (!newModuleTitle.trim()) return;
        try {
            const newOrder = modules.length;
            const res = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.MODULES,
                ID.unique(),
                {
                    title: newModuleTitle,
                    courseId: id,
                    order: newOrder
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            );
            setModules([...modules, res]);
            setModuleDialog(false);
            setNewModuleTitle('');
            toast.success('Module added');
        } catch (error) {
            toast.error('Failed to add module');
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Delete module?')) return;
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MODULES, moduleId);
            setModules(modules.filter(m => m.$id !== moduleId));
            // Cleanup lessons in local state
            setLessons(lessons.filter(l => l.moduleId !== moduleId));
            toast.success('Module deleted');
        } catch (error) {
            toast.error('Failed to delete module');
        }
    };



    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Delete lesson?')) return;
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LESSONS, lessonId);
            setLessons(lessons.filter(l => l.$id !== lessonId));

            // Update Course Lesson Count
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.COURSES,
                id,
                { lessonsCount: Math.max(0, lessons.length - 1) }
            );

            toast.success('Lesson deleted');
        } catch (error) {
            toast.error('Failed to delete lesson');
        }
    };

    if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="md">
                <Typography variant="h4" fontWeight={700} gutterBottom>Edit Course</Typography>

                <Paper component="form" onSubmit={handleSaveCourse} sx={{ p: 4, mb: 4 }}>
                    <Stack spacing={3}>
                        <TextField label="Title" name="title" value={formData.title} onChange={handleCourseChange} required fullWidth />
                        <TextField label="Description" name="description" value={formData.description} onChange={handleCourseChange} required multiline rows={3} fullWidth />

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField select label="Category" name="category" value={formData.category} onChange={handleCourseChange} required fullWidth>
                                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </TextField>
                            <TextField label="Price" name="price" type="number" value={formData.price} onChange={handleCourseChange} fullWidth />
                        </Stack>

                        <ThumbnailUploader
                            initialValue={formData.thumbnail}
                            onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                            user={user}
                        />

                        <FormControlLabel control={<Switch checked={formData.isPublished} onChange={handleCourseChange} name="isPublished" color="success" />} label="Published" />

                        <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                            {saving ? 'Saving...' : 'Save Details'}
                        </Button>
                    </Stack>
                </Paper>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight={600}>Curriculum</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setModuleDialog(true)}>Add Module</Button>
                </Stack>

                <Box sx={{ mb: 8 }}>
                    {modules.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No modules. Add one to start.</Typography></Paper>
                    ) : (
                        modules.map(module => (
                            <Accordion key={module.$id}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>{module.title}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        {lessons.filter(l => l.moduleId === module.$id).map(lesson => (
                                            <ListItem key={lesson.$id}>
                                                <LessonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                                <ListItemText primary={lesson.title} secondary={`Duration: ${lesson.duration}`} />
                                                <ListItemSecondaryAction>
                                                    <IconButton edge="end" onClick={() => handleDeleteLesson(lesson.$id)}><DeleteIcon /></IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                        {lessons.filter(l => l.moduleId === module.$id).length === 0 && (
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 1, px: 2 }}>No lessons yet.</Typography>
                                        )}
                                    </List>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Button size="small" color="error" onClick={() => handleDeleteModule(module.$id)}>Delete Module</Button>
                                        <Button size="small" startIcon={<AddIcon />} onClick={() => openAddLesson(module.$id)}>Add Lesson</Button>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </Box>
            </Container>

            {/* Module Dialog */}
            <Dialog open={moduleDialog} onClose={() => setModuleDialog(false)}>
                <DialogTitle>Add Module</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Module Title" fullWidth value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModuleDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddModule} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            {/* Lesson Dialog */}
            <Dialog open={lessonDialog} onClose={() => setLessonDialog(false)}>
                <DialogTitle>Add Lesson</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                        <TextField label="Lesson Title" fullWidth value={newLessonData.title} onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })} />
                        <TextField
                            label="YouTube Video URL"
                            fullWidth
                            value={newLessonData.youtubeUrl}
                            onChange={(e) => setNewLessonData({ ...newLessonData, youtubeUrl: e.target.value })}
                            helperText="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        />
                        <TextField label="Duration" fullWidth value={newLessonData.duration} onChange={(e) => setNewLessonData({ ...newLessonData, duration: e.target.value })} helperText="e.g. 10:30" />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLessonDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddLesson} variant="contained">Add Lesson</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default EditCourse;
