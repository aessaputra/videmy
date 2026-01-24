import { useState } from 'react';
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
} from '@mui/material';
import {
    Search as SearchIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { ROLES } from '../../context/AuthContext';

/**
 * Manage Users Page (Admin Only)
 * 
 * MUI-based user management with role assignment.
 */
export function ManageUsers() {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Demo users (will be fetched from Appwrite later)
    const [users, setUsers] = useState([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: ROLES.ADMIN, status: 'active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: ROLES.INSTRUCTOR, status: 'active' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: ROLES.STUDENT, status: 'active' },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: ROLES.STUDENT, status: 'active' },
        { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: ROLES.INSTRUCTOR, status: 'inactive' },
    ]);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = (userId, newRole) => {
        setUsers(users.map(u =>
            u.id === userId ? { ...u, role: newRole } : u
        ));
        toast.success('User role updated');
    };

    const handleToggleStatus = (userId) => {
        setUsers(users.map(u =>
            u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
        ));
        toast.success('User status updated');
    };

    const roleFilters = ['all', ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT];

    return (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Manage Users
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        View and manage user accounts and roles
                    </Typography>
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
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
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
                                            onClick={() => handleToggleStatus(user.id)}
                                            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                            size="small"
                                            color={user.status === 'active' ? 'error' : 'success'}
                                        >
                                            {user.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredUsers.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h2" sx={{ mb: 2 }}>👤</Typography>
                            <Typography variant="h6" gutterBottom>No users found</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try adjusting your search or filter
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
