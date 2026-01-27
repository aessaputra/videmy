import { useState, useEffect } from 'react';
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
    Avatar,
    Stack,
    Select,
    MenuItem,
    FormControl,
    CircularProgress,
} from '@mui/material';
import {
    Search as SearchIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { ROLES, useAuth } from '../../context/AuthContext';
import { databases, functions, DATABASE_ID, COLLECTIONS, Query, getUserAvatar } from '../../lib/appwrite';

/**
 * Manage Users Page (Admin Only)
 * 
 * Connected to 'users' collection in Appwrite Database.
 */
export function ManageUsers() {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    // Fetch Users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Note: We are fetching from the 'users' collection.
            // Ensure this collection exists and has Read permissions for 'users' or 'team:admins'.
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.USERS,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            // Map Appwrite docs to our shape
            const mappedUsers = response.documents.map(doc => ({
                id: doc.$id, // Document ID
                userId: doc.userId, // Auth Account ID
                name: doc.name,
                email: doc.email,
                role: doc.role,
                status: doc.status || 'active',
                avatar: doc.avatar // Ensure avatar is mapped from DB
            }));
            setUsers(mappedUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users. Permissions issue?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = async (docId, newRole) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                docId,
                { role: newRole }
            );

            // Optimistic Update
            setUsers(users.map(u =>
                u.id === docId ? { ...u, role: newRole } : u
            ));
            toast.success('User role updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update role');
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        try {
            // 1. Call Secure Function to Block/Unblock Auth Account
            const execution = await functions.createExecution(
                import.meta.env.VITE_APPWRITE_FUNCTION_USER_MANAGEMENT_ID,
                JSON.stringify({
                    action: 'toggle_status',
                    userId: user.userId, // Auth ID
                    documentId: user.id, // Document ID (for DB update)
                    status: newStatus
                })
            );

            const result = JSON.parse(execution.responseBody);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update auth status');
            }

            // 2. Database Record (Visual Status) is now handled by the Function
            // We just need to update UI optimistically

            // Optimistic Update
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, status: newStatus } : u
            ));

            const action = newStatus === 'active' ? 'activated' : 'deactivated';
            toast.success(`User ${action} successfully`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status: ' + error.message);
        }
    };

    const roleFilters = ['all', ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT];

    return (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Manage Users
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            View and manage user accounts and roles ({users.length})
                        </Typography>
                    </Box>
                    <Button startIcon={<RefreshIcon />} onClick={fetchUsers}>
                        Refresh
                    </Button>
                </Box>

                {/* Filters */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    <TextField
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flexGrow: 1, maxWidth: 400 }}
                    />

                    <Stack direction="row" spacing={1}>
                        {roleFilters.map((role) => (
                            <Button
                                key={role}
                                variant={roleFilter === role ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => setRoleFilter(role)}
                            >
                                {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                            </Button>
                        ))}
                    </Stack>
                </Stack>

                {/* Users Table */}
                <TableContainer component={Paper}>
                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>User</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell align="center"><strong>Role</strong></TableCell>
                                    <TableCell align="center"><strong>Status</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar
                                                    src={getUserAvatar(user)}
                                                    alt={user.name}
                                                    sx={{ width: 32, height: 32 }}
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography fontWeight={500}>{user.name}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography color="text.secondary">{user.email}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <Select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    size="small"
                                                >
                                                    <MenuItem value={ROLES.STUDENT}>Student</MenuItem>
                                                    <MenuItem value={ROLES.INSTRUCTOR}>Instructor</MenuItem>
                                                    <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={user.status}
                                                color={user.status === 'active' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => handleToggleStatus(user)}
                                                title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                size="small"
                                                color={user.status === 'active' ? 'error' : 'success'}
                                                disabled={user.userId === currentUser?.$id} // Prevent blocking self
                                            >
                                                {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h2" sx={{ mb: 2 }}>👤</Typography>
                            <Typography variant="h6" gutterBottom>No users found</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ensure 'users' collection exists and has permissions.
                            </Typography>
                        </Box>
                    )}
                </TableContainer>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Showing {filteredUsers.length} of {users.length} users
                </Typography>
            </Container>
        </Box>
    );
}

export default ManageUsers;
