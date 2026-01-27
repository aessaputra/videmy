import { useState, useEffect, useCallback } from 'react';
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
    TablePagination,
    Menu,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Search as SearchIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Refresh as RefreshIcon,
    MoreHoriz as MoreHorizIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useConfirm } from '../../context/ConfirmContext';
import { ROLES, useAuth } from '../../context/AuthContext';
import { databases, functions, DATABASE_ID, COLLECTIONS, Query, getUserAvatar } from '../../lib/appwrite';

/**
 * Manage Users Page (Admin Only)
 * 
 * Connected to 'users' collection in Appwrite Database.
 */
export function ManageUsers() {
    // URL State / Search Params could be better, but keeping local state for simplicity as per plan
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // Filters
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Data
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Auth
    const { user: currentUser } = useAuth();

    const confirm = useConfirm();

    // Menu State
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuUser, setMenuUser] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Debounce search to prevent too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0); // Reset to page 0 on search change
            fetchUsers(0, rowsPerPage, searchQuery, roleFilter, statusFilter);
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // Fetch on filter/pagination changes (skipping searchQuery which is debounced above)
    useEffect(() => {
        fetchUsers(page, rowsPerPage, searchQuery, roleFilter, statusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, roleFilter, statusFilter]);

    const fetchUsers = useCallback(async (p, limit, search, rFilter, sFilter) => {
        setLoading(true);
        try {
            const queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(limit),
                Query.offset(p * limit),
            ];

            if (search) {
                // Assuming 'name' index exists. If not, this might fail or need multiple queries.
                // Using search on name usually requires a FullText index in Appwrite.
                queries.push(Query.search('name', search));
            }

            if (rFilter !== 'all') {
                queries.push(Query.equal('role', rFilter));
            }

            if (sFilter !== 'all') {
                queries.push(Query.equal('status', sFilter));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.USERS,
                queries
            );

            const mappedUsers = response.documents.map(doc => ({
                id: doc.$id,
                userId: doc.userId,
                name: doc.name,
                email: doc.email,
                role: doc.role,
                status: doc.status || 'active',
                avatar: doc.avatar
            }));

            setUsers(mappedUsers);
            setTotalUsers(response.total);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users. Please check connection.');
        } finally {
            setLoading(false);
        }
    }, [/* dependencies if any, databases/COLLECTIONS are constant */]);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setMenuUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuUser(null);
    };

    // --- Actions with Confirmation ---

    const requestRoleChange = (user, newRole) => {
        handleMenuClose();
        // Add small delay to allow Menu to close and prevent event conflicts
        setTimeout(async () => {
            const isConfirmed = await confirm({
                title: 'Change User Role',
                description: `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
                confirmationText: 'Confirm',
                cancellationText: 'Cancel',
                confirmationButtonProps: { variant: 'contained', color: 'primary' },
            });

            if (isConfirmed) {
                await performRoleChange(user.id, newRole);
            } else {
                console.log('Role change cancelled');
                // toast.info('Role change cancelled');
            }
        }, 100);
    };

    const performRoleChange = async (docId, newRole) => {
        try {
            // Find the user object to get userId (needed for function)
            const user = users.find(u => u.id === docId);
            if (!user) throw new Error('User not found');

            // Call Secure Function
            const execution = await functions.createExecution(
                import.meta.env.VITE_APPWRITE_FUNCTION_USER_MANAGEMENT_ID,
                JSON.stringify({
                    action: 'update_role',
                    userId: user.userId,
                    documentId: docId,
                    role: newRole
                })
            );

            const result = JSON.parse(execution.responseBody);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update role');
            }

            // Optimistic update of local state
            setUsers(users.map(u => u.id === docId ? { ...u, role: newRole } : u));
            toast.success('User role updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update role: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const requestStatusToggle = (user) => {
        handleMenuClose();
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const isDeactivating = newStatus === 'inactive';

        setTimeout(async () => {
            const isConfirmed = await confirm({
                title: isDeactivating ? 'Deactivate User?' : 'Activate User?',
                description: isDeactivating
                    ? `This will prevent ${user.name} from logging in. Are you sure?`
                    : `This will restore ${user.name}'s access to the platform.`,
                confirmationText: 'Confirm',
                cancellationText: 'Cancel',
                confirmationButtonProps: {
                    variant: 'contained',
                    color: isDeactivating ? 'error' : 'primary',
                    autoFocus: true
                },
            });

            if (isConfirmed) {
                await performStatusToggle(user, newStatus);
            } else {
                console.log('Status toggle cancelled');
            }
        }, 100);
    };

    const performStatusToggle = async (user, newStatus) => {
        try {
            // 1. Call Secure Function
            const execution = await functions.createExecution(
                import.meta.env.VITE_APPWRITE_FUNCTION_USER_MANAGEMENT_ID,
                JSON.stringify({
                    action: 'toggle_status',
                    userId: user.userId,
                    documentId: user.id,
                    status: newStatus
                })
            );

            const result = JSON.parse(execution.responseBody);
            if (!result.success) {
                throw new Error(result.error || 'Failed to update auth status');
            }

            // 2. Optimistic Update
            setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));

            const action = newStatus === 'active' ? 'activated' : 'deactivated';
            toast.success(`User ${action} successfully`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status: ' + error.message);
        } finally {
            setLoading(false);
        }
    };





    // --- Render ---

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
                            Total users: {totalUsers}
                        </Typography>
                    </Box>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => fetchUsers(page, rowsPerPage, searchQuery, roleFilter, statusFilter)}
                        variant="soft"
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Controls Card */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                    >
                        <TextField
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flexGrow: 1, maxWidth: { md: 320 } }}
                        />

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                                value={roleFilter}
                                onChange={(e) => {
                                    setRoleFilter(e.target.value);
                                    setPage(0);
                                }}
                                displayEmpty
                            >
                                <MenuItem value="all">All Roles</MenuItem>
                                <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
                                <MenuItem value={ROLES.INSTRUCTOR}>Instructor</MenuItem>
                                <MenuItem value={ROLES.STUDENT}>Student</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(0);
                                }}
                                displayEmpty
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Paper>

                {/* Users Table */}
                <Paper
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <TableContainer>
                        <Table sx={{ minWidth: 700 }}>
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell><strong>User</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell align="center"><strong>Role</strong></TableCell>
                                    <TableCell align="center"><strong>Status</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <CircularProgress size={40} />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <Typography variant="h6" color="text.secondary">No users found</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Try adjusting your search or filters
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Avatar
                                                        src={getUserAvatar(user)}
                                                        alt={user.name}
                                                        sx={{ width: 36, height: 36 }}
                                                    >
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {user.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: { md: 'none' } }}>
                                                            {user.email}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{user.email}</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={user.role}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={user.status}
                                                    color={user.status === 'active' ? 'success' : 'warning'}
                                                    variant={user.status === 'active' ? 'filled' : 'outlined'}
                                                    size="small"
                                                    sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={(e) => handleMenuOpen(e, user)}
                                                    sx={{ p: 1 }}
                                                >
                                                    <MoreHorizIcon sx={{ fontSize: 28 }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <TablePagination
                        component="div"
                        count={totalUsers}
                        page={page}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage="Users per page:"
                    />
                </Paper>
            </Container>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 3,
                    sx: { minWidth: 180, mt: 1 }
                }}
            >
                {menuUser && [
                    <Box key="role-header" sx={{ px: 2, py: 1, typography: 'caption', color: 'text.secondary', display: 'block' }}>
                        Change Role
                    </Box>,
                    [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN].map((role) => (
                        <MenuItem
                            key={role}
                            onClick={() => requestRoleChange(menuUser, role)}
                            selected={menuUser.role === role}
                            disabled={menuUser.role === role}
                            dense
                        >
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={`Make ${role.charAt(0).toUpperCase() + role.slice(1)}`} />
                        </MenuItem>
                    )),
                    <Box key="divider" sx={{ my: 1, borderTop: '1px solid', borderColor: 'divider' }} />,
                    <MenuItem
                        key="status"
                        onClick={() => requestStatusToggle(menuUser)}
                        sx={{ color: menuUser.status === 'active' ? 'error.main' : 'success.main' }}
                        disabled={menuUser.userId === currentUser?.$id}
                    >
                        <ListItemIcon>
                            {menuUser.status === 'active' ?
                                <BlockIcon fontSize="small" color={menuUser.userId === currentUser?.$id ? 'disabled' : 'error'} /> :
                                <CheckCircleIcon fontSize="small" color="success" />
                            }
                        </ListItemIcon>
                        <ListItemText primary={menuUser.status === 'active' ? 'Block User' : 'Activate User'} />
                    </MenuItem>
                ]}
            </Menu>


        </Box>
    );
}

export default ManageUsers;
