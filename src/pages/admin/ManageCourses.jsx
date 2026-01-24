import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Stack,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

/**
 * Manage Courses Page (Admin/Instructor)
 * 
 * MUI-based CRUD interface for managing courses.
 */
export function ManageCourses() {
    const { user, hasRole, ROLES } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    // Demo courses (will be fetched from Appwrite later)
    const [courses, setCourses] = useState([
        {
            id: '1',
            title: 'Complete Web Development Bootcamp',
            category: 'Web Development',
            lessonsCount: 120,
            studentsCount: 2500,
            isPublished: true,
            instructorId: user?.$id,
        },
        {
            id: '2',
            title: 'UI/UX Design Masterclass',
            category: 'Design',
            lessonsCount: 85,
            studentsCount: 1800,
            isPublished: true,
            instructorId: user?.$id,
        },
        {
            id: '3',
            title: 'Python for Data Science',
            category: 'Data Science',
            lessonsCount: 95,
            studentsCount: 3200,
            isPublished: false,
            instructorId: user?.$id,
        },
    ]);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTogglePublish = (courseId) => {
        setCourses(courses.map(c =>
            c.id === courseId ? { ...c, isPublished: !c.isPublished } : c
        ));
        toast.success('Course status updated');
    };

    const handleDelete = (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            setCourses(courses.filter(c => c.id !== courseId));
            toast.success('Course deleted');
        }
    };

    return (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                    sx={{ mb: 4 }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Manage Courses
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {hasRole(ROLES.ADMIN) ? 'Manage all courses on the platform' : 'Manage your courses'}
                        </Typography>
                    </Box>
                    <Button
                        component={Link}
                        to="/admin/courses/new"
                        variant="contained"
                        startIcon={<AddIcon />}
                    >
                        Create Course
                    </Button>
                </Stack>

                {/* Search */}
                <TextField
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 3, maxWidth: 400 }}
                    fullWidth
                />

                {/* Courses Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Course</strong></TableCell>
                                <TableCell><strong>Category</strong></TableCell>
                                <TableCell align="center"><strong>Lessons</strong></TableCell>
                                <TableCell align="center"><strong>Students</strong></TableCell>
                                <TableCell align="center"><strong>Status</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCourses.map((course) => (
                                <TableRow key={course.id} hover>
                                    <TableCell>
                                        <Typography
                                            component={Link}
                                            to={`/courses/${course.id}`}
                                            sx={{
                                                fontWeight: 500,
                                                color: 'text.primary',
                                                textDecoration: 'none',
                                                '&:hover': { color: 'primary.main' },
                                            }}
                                        >
                                            {course.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography color="text.secondary">
                                            {course.category}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">{course.lessonsCount}</TableCell>
                                    <TableCell align="center">{course.studentsCount.toLocaleString()}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={course.isPublished ? 'Published' : 'Draft'}
                                            color={course.isPublished ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <IconButton
                                                onClick={() => handleTogglePublish(course.id)}
                                                title={course.isPublished ? 'Unpublish' : 'Publish'}
                                                size="small"
                                            >
                                                {course.isPublished ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                to={`/admin/courses/${course.id}/edit`}
                                                title="Edit"
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(course.id)}
                                                title="Delete"
                                                size="small"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredCourses.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h2" sx={{ mb: 2 }}>📚</Typography>
                            <Typography variant="h6" gutterBottom>No courses found</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchQuery
                                    ? 'Try adjusting your search query'
                                    : 'Create your first course to get started'}
                            </Typography>
                        </Box>
                    )}
                </TableContainer>
            </Container>
        </Box>
    );
}

export default ManageCourses;
