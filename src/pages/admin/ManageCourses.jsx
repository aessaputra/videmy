import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Avatar,
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
    People as PeopleIcon,
    Launch as LaunchIcon,
    School as SchoolIcon,
    Image as ImageIcon,
    MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { databases, COLLECTIONS, DATABASE_ID, Query } from '../../lib/appwrite';

import CourseStatsDialog from '../../components/admin/CourseStatsDialog';

/**
 * Manage Courses Page (Admin/Instructor)
 * 
 * MUI-based CRUD interface for managing courses.
 */
export function ManageCourses() {
    const { user, hasRole, ROLES } = useAuth();
    const confirm = useConfirm();
    const [searchQuery, setSearchQuery] = useState('');

    // Demo courses (will be fetched from Appwrite later)
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Stats Dialog State
    const [statsOpen, setStatsOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Menu State
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
    const [actionMenuCourse, setActionMenuCourse] = useState(null);

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

            // Fetch Instructor details (names)
            const instructorIds = [...new Set(response.documents.map(d => d.instructorId).filter(Boolean))];
            let instructorMap = {};

            if (instructorIds.length > 0) {
                try {
                    const usersRes = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.USERS,
                        [Query.equal('userId', instructorIds)]
                    );
                    usersRes.documents.forEach(u => {
                        instructorMap[u.userId] = u.name;
                    });
                } catch (e) {
                    console.error("Failed to fetch instructors", e);
                }
            }

            // Map Appwrite documents to local state format
            const mappedCourses = response.documents.map(doc => ({
                id: doc.$id,
                title: doc.title,
                category: doc.category || 'Uncategorized',
                lessonsCount: doc.lessonsCount || 0,
                studentsCount: doc.studentsCount || 0, // Use cached count
                isPublished: doc.isPublished || false,
                instructorId: doc.instructorId,
                instructorName: instructorMap[doc.instructorId] || doc.instructorName || doc.instructorId,
                thumbnail: doc.thumbnail, // Add thumbnail mapping
            }));

            // Use mapped courses directly
            setCourses(mappedCourses);

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

    const handleDelete = (courseId) => {
        // Wrap in setTimeout to prevent Menu event conflict (Ghost clicks)
        setTimeout(async () => {
            const isConfirmed = await confirm({
                title: 'Delete Course?',
                description: 'Are you sure you want to delete this course? This cannot be undone and will remove all lessons associated with it.',
                confirmationText: 'Delete',
                cancellationText: 'Cancel',
                confirmationButtonProps: { variant: 'contained', color: 'error', autoFocus: true },
            });

            if (isConfirmed) {
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
        }, 100);
    };

    const handleActionMenuOpen = (event, course) => {
        event.stopPropagation();
        setActionMenuAnchor(event.currentTarget);
        setActionMenuCourse(course);
    };

    const handleActionMenuClose = () => {
        setActionMenuAnchor(null);
        setActionMenuCourse(null);
    };

    const handleMenuAction = (action) => {
        if (!actionMenuCourse) return;

        const course = actionMenuCourse;
        handleActionMenuClose();

        switch (action) {
            case 'edit':
                // Handled via Link in MenuItem usually, but we can standard nav here if needed
                break;
            case 'toggle-publish':
                handleTogglePublish(course.id, course.isPublished);
                break;
            case 'delete':
                handleDelete(course.id);
                break;
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
                                <TableCell sx={{ width: 'auto' }}><strong>All Courses</strong></TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', width: '1%' }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCourses.map((course) => (
                                <TableRow key={course.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            {/* Thumbnail */}
                                            <Avatar
                                                src={course.thumbnail}
                                                variant="rounded"
                                                sx={{ width: 64, height: 36, bgcolor: 'action.hover' }}
                                            >
                                                <ImageIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                            </Avatar>

                                            {/* Title & Instructor */}
                                            <Box>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={600}
                                                        onClick={() => {
                                                            setSelectedCourse(course);
                                                            setStatsOpen(true);
                                                        }}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                                                        }}
                                                    >
                                                        {course.title}
                                                    </Typography>
                                                    <IconButton
                                                        component={Link}
                                                        to={`/courses/${course.id}`}
                                                        target="_blank"
                                                        size="small"
                                                        sx={{
                                                            padding: 0.5,
                                                            color: 'action.active',
                                                            '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <LaunchIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Stack>

                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <Chip
                                                        label={course.isPublished ? 'Published' : 'Draft'}
                                                        color={course.isPublished ? 'success' : 'warning'}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                    />
                                                    {hasRole(ROLES.ADMIN) && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            by {course.instructorName}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </TableCell>

                                    <TableCell align="right">
                                        <IconButton
                                            onClick={(e) => handleActionMenuOpen(e, course)}
                                            // Removed size="small" to make it standard size (medium)
                                            sx={{ p: 1 }} // Add padding for larger touch target
                                        >
                                            <MoreHorizIcon sx={{ fontSize: 28 }} />
                                        </IconButton>
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

                <Menu
                    anchorEl={actionMenuAnchor}
                    open={Boolean(actionMenuAnchor)}
                    onClose={handleActionMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                        elevation: 3,
                        sx: { minWidth: 180, mt: 1 }
                    }}
                >
                    <MenuItem component={Link} to={`/admin/courses/${actionMenuCourse?.id}/edit`} onClick={handleActionMenuClose}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Edit Course</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={() => handleMenuAction('toggle-publish')}>
                        <ListItemIcon>
                            {actionMenuCourse?.isPublished ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>{actionMenuCourse?.isPublished ? 'Unpublish' : 'Publish'}</ListItemText>
                    </MenuItem>

                    <Divider />

                    <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>
            </Container>

            {/* Stats/Manage Dialog */}
            <CourseStatsDialog
                open={statsOpen}
                onClose={() => setStatsOpen(false)}
                course={selectedCourse}
            />
        </Box>
    );
}

export default ManageCourses;
