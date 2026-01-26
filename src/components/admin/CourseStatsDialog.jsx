import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Stack,
    Chip,
    CircularProgress,
    TextField,
    InputAdornment,
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    School as SchoolIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { databases, avatars, COLLECTIONS, DATABASE_ID, Query } from '../../lib/appwrite';
import { toast } from 'sonner';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`course-tabpanel-${index}`}
            aria-labelledby={`course-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function CourseStatsDialog({ open, onClose, course }) {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (open && course) {
            setTab(0); // Reset to first tab
            fetchCourseDetails();
        }
    }, [open, course]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            // 1. Fetch Enrollments for this course
            const enrollmentsRes = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.ENROLLMENTS,
                [
                    Query.equal('courseId', course.id),
                    Query.limit(100), // Pagination limit
                    Query.orderDesc('enrolledAt')
                ]
            );

            // 2. Get User IDs to fetch details
            const userIds = enrollmentsRes.documents.map(e => e.userId);

            // 3. Fetch User Profiles
            // We need to fetch users who match these IDs.
            // Appwrite queries for array of values: Query.equal('userId', [list])

            let userProfiles = [];
            if (userIds.length > 0) {
                // Determine attribute to query. In AuthContext, we create docs with 'userId' attribute equal to Auth ID.
                const usersRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.USERS,
                    [
                        Query.equal('userId', userIds),
                        Query.limit(100)
                    ]
                );
                userProfiles = usersRes.documents;
            }

            // 4. Map Enrollments + Profiles
            const mappedStudents = enrollmentsRes.documents.map(enrollment => {
                const profile = userProfiles.find(u => u.userId === enrollment.userId);
                return {
                    id: enrollment.$id,
                    userId: enrollment.userId,
                    name: profile?.name || 'Unknown User',
                    email: profile?.email || 'No Email',
                    enrolledAt: enrollment.enrolledAt,
                    enrolledAt: enrollment.enrolledAt,
                    status: profile?.status || 'active',
                    // Use Custom Avatar (DB) OR Fallback to Appwrite Initials
                    avatar: profile?.avatar
                        ? profile.avatar
                        : avatars.getInitials(profile?.name || 'U').toString()
                };
            });

            setStudents(mappedStudents);

        } catch (error) {
            console.error('Failed to fetch stats:', error);
            toast.error('Failed to load student list');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleClose = () => {
        setSearchQuery('');
        onClose();
    };

    if (!course) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2, minHeight: '60vh' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {course.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Course Management
                    </Typography>
                </Box>
                <Button onClick={handleClose} sx={{ minWidth: 'auto', p: 1 }}>
                    <CloseIcon />
                </Button>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                        <Tab label="Review & Stats" />
                        <Tab
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <span>Students</span>
                                    <Chip
                                        label={loading ? '...' : students.length}
                                        size="small"
                                        color="primary"
                                        variant="soft"
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                </Stack>
                            }
                        />
                    </Tabs>
                </Box>

                <TabPanel value={tab} index={0}>
                    <Box sx={{ px: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2 }}>Quick Stats</Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Paper variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                <Typography variant="h4" color="primary.main" fontWeight={700}>
                                    {course.studentsCount}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Total Students</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                <Typography variant="h4" color="primary.main" fontWeight={700}>
                                    {course.lessonsCount}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Total Lessons</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main" fontWeight={700}>
                                    {course.isPublished ? 'Live' : 'Draft'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Status</Typography>
                            </Paper>
                        </Stack>

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Course Details</Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Instructor:</Typography>
                                        <Typography variant="body2" fontWeight={500}>{course.instructorName}</Typography>
                                    </Stack>
                                    <Divider />
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Category:</Typography>
                                        <Typography variant="body2" fontWeight={500}>{course.category}</Typography>
                                    </Stack>
                                    <Divider />
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">Course ID:</Typography>
                                        <Typography variant="caption" fontFamily="monospace">{course.id}</Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Box>
                    </Box>
                </TabPanel>

                <TabPanel value={tab} index={1}>
                    <Box sx={{ px: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="subtitle2">
                                Enrolled Students
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                                }}
                            />
                        </Stack>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                <CircularProgress />
                            </Box>
                        ) : filteredStudents.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                                <Typography>No students found matching your criteria</Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Student</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Enrolled Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredStudents.map((student) => (
                                            <TableRow key={student.id} hover>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar
                                                            src={student.avatar}
                                                            alt={student.name}
                                                            sx={{ width: 32, height: 32 }}
                                                        />
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {student.name}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {student.email}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(student.enrolledAt).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </TabPanel>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
