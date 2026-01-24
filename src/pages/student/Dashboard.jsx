import { Link } from 'react-router-dom';
import { HiPlay, HiAcademicCap, HiClock, HiCheckCircle } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common';

/**
 * Dashboard Page
 * 
 * Student dashboard showing enrolled courses and progress.
 */
export function Dashboard() {
    const { user, hasRole, ROLES } = useAuth();

    // Demo enrolled courses (will be fetched from Appwrite later)
    const enrolledCourses = [
        {
            id: '1',
            title: 'Complete Web Development Bootcamp',
            thumbnail: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800',
            progress: 35,
            completedLessons: 42,
            totalLessons: 120,
            lastLesson: { id: 'l5', title: 'Working with Text' },
        },
        {
            id: '2',
            title: 'UI/UX Design Masterclass',
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
            progress: 15,
            completedLessons: 13,
            totalLessons: 85,
            lastLesson: { id: 'l4', title: 'Color Theory' },
        },
    ];

    const stats = [
        {
            label: 'Enrolled Courses',
            value: enrolledCourses.length,
            icon: HiAcademicCap,
            color: 'var(--color-primary)'
        },
        {
            label: 'Completed Lessons',
            value: enrolledCourses.reduce((acc, c) => acc + c.completedLessons, 0),
            icon: HiCheckCircle,
            color: 'var(--color-success)'
        },
        {
            label: 'Hours Learned',
            value: '12.5',
            icon: HiClock,
            color: 'var(--color-warning)'
        },
        {
            label: 'Avg Progress',
            value: `${Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length || 0)}%`,
            icon: HiPlay,
            color: 'var(--color-info)'
        },
    ];

    return (
        <div className="dashboard">
            <div className="container">
                {/* Header */}
                <div className="dashboard__header">
                    <h1 className="dashboard__title">Welcome back, {user?.name || 'Student'}!</h1>
                    <p className="dashboard__subtitle">
                        {hasRole(ROLES.INSTRUCTOR)
                            ? 'Manage your courses and track student progress'
                            : 'Continue your learning journey'}
                    </p>
                </div>

                {/* Stats */}
                <div className="dashboard__stats">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="flex items-center gap-sm mb-sm">
                                <stat.icon size={20} style={{ color: stat.color }} />
                                <span className="stat-card__label">{stat.label}</span>
                            </div>
                            <div className="stat-card__value">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions for Instructor/Admin */}
                {hasRole([ROLES.INSTRUCTOR, ROLES.ADMIN]) && (
                    <div className="card mb-xl">
                        <h2 className="text-lg font-semibold mb-md">Quick Actions</h2>
                        <div className="flex gap-md flex-wrap">
                            <Link to="/admin/courses">
                                <Button variant="primary">
                                    <HiAcademicCap />
                                    Manage Courses
                                </Button>
                            </Link>
                            <Link to="/admin/courses/new">
                                <Button variant="secondary">
                                    Create New Course
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Enrolled Courses */}
                <div>
                    <div className="flex items-center justify-between mb-lg">
                        <h2 className="text-xl font-semibold">My Courses</h2>
                        <Link to="/courses">
                            <Button variant="ghost" size="sm">
                                Browse More
                            </Button>
                        </Link>
                    </div>

                    {enrolledCourses.length > 0 ? (
                        <div className="courses-grid">
                            {enrolledCourses.map((course) => (
                                <div key={course.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    {/* Thumbnail */}
                                    <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: 'var(--color-bg-tertiary)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '100%',
                                                    width: `${course.progress}%`,
                                                    background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: 'var(--space-lg)' }}>
                                        <h3 className="font-semibold mb-sm" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {course.title}
                                        </h3>

                                        <div className="flex items-center justify-between mb-md">
                                            <span className="text-sm text-secondary">
                                                {course.completedLessons} / {course.totalLessons} lessons
                                            </span>
                                            <span className="badge badge--primary">{course.progress}%</span>
                                        </div>

                                        <p className="text-sm text-muted mb-md">
                                            Last: {course.lastLesson.title}
                                        </p>

                                        <Link to={`/learn/${course.id}/${course.lastLesson.id}`}>
                                            <Button variant="primary" fullWidth>
                                                <HiPlay />
                                                Continue
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state__icon">📚</div>
                            <h3 className="empty-state__title">No courses yet</h3>
                            <p className="empty-state__desc">
                                You haven't enrolled in any courses. Start learning today!
                            </p>
                            <Link to="/courses">
                                <Button variant="primary">
                                    Browse Courses
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
