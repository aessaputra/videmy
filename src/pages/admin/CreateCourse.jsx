import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { databases, ID, COLLECTIONS, DATABASE_ID, Permission, Role } from '../../lib/appwrite';
import { ThumbnailUploader } from '../../components/admin/ThumbnailUploader';

export function CreateCourse() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Web Development',
        price: 0,
        isPublished: false,
        thumbnail: '', // URL or File placeholder
    });

    const categories = [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'Design',
        'Business',
        'Marketing'
    ];

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('You must be logged in');
            return;
        }

        setLoading(true);
        try {
            // Create Course Document
            const courseData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                price: Number(formData.price),
                isPublished: formData.isPublished,
                instructorId: user.$id,
                thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', // Default placeholder
                studentsCount: 0,
                lessonsCount: 0,
                lessonsCount: 0,
            };

            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.COURSES,
                ID.unique(),
                courseData,
                [
                    Permission.read(Role.any()), // Public can read
                    Permission.update(Role.user(user.$id)), // Only creator can update
                    Permission.delete(Role.user(user.$id)), // Only creator can delete
                ]
            );

            toast.success('Course created successfully');
            navigate('/admin/courses');

        } catch (error) {
            console.error('Create course failed:', error);
            toast.error('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="md">
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Create New Course
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Fill in the details to create your new course.
                </Typography>

                <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <TextField
                            label="Course Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            multiline
                            rows={4}
                            fullWidth
                        />

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                select
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                fullWidth
                            >
                                {categories.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Price ($)"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        </Stack>

                        <ThumbnailUploader
                            initialValue={formData.thumbnail}
                            onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                            user={user}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleChange}
                                    color="success"
                                />
                            }
                            label="Publish immediately"
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}

export default CreateCourse;
