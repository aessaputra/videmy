import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiEye, HiEyeOff, HiSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/common';

/**
 * Manage Courses Page (Admin/Instructor)
 * 
 * CRUD interface for managing courses.
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
        <div className="py-xl">
            <div className="container">
                {/* Header */}
                <div className="flex items-center justify-between mb-xl flex-wrap gap-md">
                    <div>
                        <h1 className="text-2xl font-bold mb-sm">Manage Courses</h1>
                        <p className="text-secondary">
                            {hasRole(ROLES.ADMIN) ? 'Manage all courses on the platform' : 'Manage your courses'}
                        </p>
                    </div>
                    <Link to="/admin/courses/new">
                        <Button variant="primary">
                            <HiPlus />
                            Create Course
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="mb-lg" style={{ maxWidth: '400px' }}>
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
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                {/* Courses Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-bg-tertiary)' }}>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: 'var(--font-semibold)' }}>
                                        Course
                                    </th>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontWeight: 'var(--font-semibold)' }}>
                                        Category
                                    </th>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'center', fontWeight: 'var(--font-semibold)' }}>
                                        Lessons
                                    </th>
                                    <th style={{ padding: 'var(--space-md)', textAlign: 'center', fontWeight: 'var(--font-semibold)' }}>
                                        Students
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
                                {filteredCourses.map((course) => (
                                    <tr
                                        key={course.id}
                                        style={{ borderBottom: '1px solid var(--color-border)' }}
                                    >
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <Link
                                                to={`/courses/${course.id}`}
                                                style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}
                                            >
                                                {course.title}
                                            </Link>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', color: 'var(--color-text-secondary)' }}>
                                            {course.category}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                                            {course.lessonsCount}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                                            {course.studentsCount.toLocaleString()}
                                        </td>
                                        <td style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                                            <span className={`badge ${course.isPublished ? 'badge--success' : 'badge--warning'}`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-md)' }}>
                                            <div className="flex gap-sm justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleTogglePublish(course.id)}
                                                    title={course.isPublished ? 'Unpublish' : 'Publish'}
                                                >
                                                    {course.isPublished ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                                                </Button>
                                                <Link to={`/admin/courses/${course.id}/edit`}>
                                                    <Button variant="ghost" size="sm" title="Edit">
                                                        <HiPencil size={18} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(course.id)}
                                                    title="Delete"
                                                    style={{ color: 'var(--color-error)' }}
                                                >
                                                    <HiTrash size={18} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCourses.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state__icon">📚</div>
                            <h3 className="empty-state__title">No courses found</h3>
                            <p className="empty-state__desc">
                                {searchQuery
                                    ? 'Try adjusting your search query'
                                    : 'Create your first course to get started'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManageCourses;
