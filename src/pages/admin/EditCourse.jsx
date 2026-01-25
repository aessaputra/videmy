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
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { databases, COLLECTIONS, DATABASE_ID, ID, Query, Permission, Role } from '../../lib/appwrite';
import { ThumbnailUploader } from '../../components/admin/ThumbnailUploader';

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
                    duration: newLessonData.duration || '10:00',
                    moduleId: newLessonData.moduleId,
                    content: '', // Description/Content
                    order: lessons.filter(l => l.moduleId === newLessonData.moduleId).length
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            );
            setLessons([...lessons, res]);
            setLessonDialog(false);
            toast.success('Lesson added');
        } catch (error) {
            console.error(error);
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
                price: Number(formData.price),
                isPublished: formData.isPublished,
                thumbnail: formData.thumbnail,
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
