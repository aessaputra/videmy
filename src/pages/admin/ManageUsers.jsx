import { useState } from 'react';
import { HiSearch, HiUserCircle, HiShieldCheck, HiBan } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { ROLES } from '../../context/AuthContext';
import { Button } from '../../components/common';

/**
 * Manage Users Page (Admin Only)
 * 
 * User management with role assignment.
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

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case ROLES.ADMIN: return 'badge--primary';
            case ROLES.INSTRUCTOR: return 'badge--success';
            default: return '';
        }
    };

    return (
        <div className="py-xl">
            <div className="container">
                {/* Header */}
                <div className="mb-xl">
                    <h1 className="text-2xl font-bold mb-sm">Manage Users</h1>
                    <p className="text-secondary">View and manage user accounts and roles</p>
                </div>

                {/* Filters */}
                <div className="flex gap-md mb-lg flex-wrap">
                    <div style={{ flex: 1, minWidth: '200px', maxWidth: '400px' }}>
                        <div style={{ position: 'relative' }}>
                            <HiSearch
                                size={20}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-muted)'
                                }}
                            />
                            <input
                                type="text"
                                className="input"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-sm">
                        {['all', ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT].map((role) => (
                            <Button
                                key={role}
                                variant={roleFilter === role ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setRoleFilter(role)}
                            >
                                {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Users Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-bg-tertiary)' }}>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: 'var(--font-semibold)' }}>
                                        User
                                    </th>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: 'var(--font-semibold)' }}>
                                        Email
                                    </th>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'center', fontWeight: 'var(--font-semibold)' }}>
                                        Role
                                    </th>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'center', fontWeight: 'var(--font-semibold)' }}>
                                        Status
                                    </th>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'right', fontWeight: 'var(--font-semibold)' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        style={{ borderBottom: '1px solid var(--color-border)' }}
                                    >
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <div className="flex items-center gap-sm">
                                                <div className="avatar avatar--sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', color: 'var(--color-text-secondary)' }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="input"
                                                style={{ width: 'auto', padding: 'var(--space-xs) var(--space-sm)' }}
                                            >
                                                <option value={ROLES.STUDENT}>Student</option>
                                                <option value={ROLES.INSTRUCTOR}>Instructor</option>
                                                <option value={ROLES.ADMIN}>Admin</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                                            <span className={`badge ${user.status === 'active' ? 'badge--success' : 'badge--warning'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <div className="flex gap-sm justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(user.id)}
                                                    title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {user.status === 'active' ? (
                                                        <HiBan size={18} style={{ color: 'var(--color-error)' }} />
                                                    ) : (
                                                        <HiShieldCheck size={18} style={{ color: 'var(--color-success)' }} />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state__icon">👤</div>
                            <h3 className="empty-state__title">No users found</h3>
                            <p className="empty-state__desc">Try adjusting your search or filter</p>
                        </div>
                    )}
                </div>

                <p className="text-sm text-muted mt-md">
                    Showing {filteredUsers.length} of {users.length} users
                </p>
            </div>
        </div>
    );
}

export default ManageUsers;
