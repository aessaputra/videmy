import { useState, useEffect } from 'react';
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
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { databases, COLLECTIONS, DATABASE_ID, Query } from '../../lib/appwrite';

/**
 * Manage Courses Page (Admin/Instructor)
 * 
 * MUI-based CRUD interface for managing courses.
 */
export function ManageCourses() {
    const { user, hasRole, ROLES } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    // Demo courses (will be fetched from Appwrite later)
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && hasRole(ROLES.INSTRUCTOR)) {
            fetchCourses();
        }
    }, [user]);

    const fetchCourses = async () => {
        try {
            const queries = [Query.orderDesc('$createdAt')];

            // If NOT admin, only show own courses
            if (!hasRole(ROLES.ADMIN)) {
                queries.push(Query.equal('instructorId', user.$id));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COURSES,
                queries
            );

            // Map Appwrite documents to local state format
            const mappedCourses = response.documents.map(doc => ({
                id: doc.$id,
                title: doc.title,
                category: doc.category || 'Uncategorized',
                lessonsCount: doc.lessonsCount || 0,
                studentsCount: 0, // Will update below
                isPublished: doc.isPublished || false,
                instructorId: doc.instructorId,
                instructorName: doc.instructorName || doc.instructorId,
            }));

            setCourses(mappedCourses);

            // Fetch accurate stats for each course individually
            // This is safer than a bulk query which might hit URL limits or array handling bugs
            const coursesWithStats = await Promise.all(mappedCourses.map(async (course) => {
                try {
                    // Parallel Requests for this single course
                    // 1. Get Enrollments (Students)
                    // 2. Get Modules -> Lessons (Lessons)

                    const [enrollmentsRes, modulesRes] = await Promise.all([
                        databases.listDocuments(
                            DATABASE_ID,
                            COLLECTIONS.ENROLLMENTS,
                            [
                                Query.equal('courseId', course.id),
                                Query.limit(1000) // Max limit to catch all students
                            ]
                        ),
                        databases.listDocuments(
                            DATABASE_ID,
                            COLLECTIONS.MODULES,
                            [
                                Query.equal('courseId', course.id),
                                Query.limit(1000)
                            ]
                        )
                    ]);

                    const studentCount = enrollmentsRes.total; // Use .total from Appwrite response!

                    // Calc Lesson Count
                    let lessonCount = 0;
                    const modules = modulesRes.documents;
                    if (modules.length > 0) {
                        const moduleIds = modules.map(m => m.$id);
                        // Fetch lessons for these modules
                        // Need chunking if > 100 modules? Unlikely.
                        const lessonsRes = await databases.listDocuments(
                            DATABASE_ID,
                            COLLECTIONS.LESSONS,
                            [
                                Query.equal('moduleId', moduleIds),
                                Query.limit(1000)
                            ]
                        );
                        lessonCount = lessonsRes.total; // Use .total!
                    }

                    return {
                        ...course,
                        studentsCount: studentCount,
                        lessonsCount: lessonCount
                    };

                } catch (err) {
                    console.error(`Failed to fetch stats for course ${course.id}`, err);
                    return course; // Return original if fail
                }
            }));

            // Final Update
            setCourses(coursesWithStats);

        } catch (error) {
            console.error('Failed to fetch courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublish = async (courseId, currentStatus) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.COURSES,
                courseId,
                {
                    isPublished: !currentStatus
                }
            );

            setCourses(prev => prev.map(c =>
                c.id === courseId ? { ...c, isPublished: !c.isPublished } : c
            ));
            toast.success('Course status updated');
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update course status');
        }
    };

    const handleDelete = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course? This cannot be undone.')) {
            try {
                await databases.deleteDocument(
                    DATABASE_ID,
                    COLLECTIONS.COURSES,
                    courseId
                );

                setCourses(courses.filter(c => c.id !== courseId));
                toast.success('Course deleted');
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete course');
            }
        }
    };



    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                {hasRole(ROLES.ADMIN) && <TableCell><strong>Instructor</strong></TableCell>}
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
                                    {hasRole(ROLES.ADMIN) && (
                                        <TableCell>
                                            <Chip
                                                label={course.instructorName}
                                                size="small"
                                                variant="outlined"
                                                sx={{ maxWidth: 150 }}
                                            />
                                        </TableCell>
                                    )}
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
