import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiPlay, HiUsers, HiClock, HiCheck, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common';

/**
 * Course Detail Page
 * 
 * Shows course information, curriculum, and enrollment button.
 */
export function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [expandedModules, setExpandedModules] = useState({});

    // Demo course data (will be fetched from Appwrite later)
    const course = {
        id,
        title: 'Complete Web Development Bootcamp',
        description: 'Pelajari web development dari dasar hingga mahir. Kursus ini mencakup HTML, CSS, JavaScript, React, Node.js, dan database. Anda akan membangun beberapa proyek nyata dan siap untuk karir sebagai web developer.',
        category: 'Web Development',
        thumbnail: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=1200',
        instructor: {
            name: 'John Doe',
            avatar: 'JD',
        },
        lessonsCount: 120,
        studentsCount: 2500,
        duration: '40 hours',
        isEnrolled: false,
        modules: [
            {
                id: 'm1',
                title: 'Introduction to Web Development',
                lessons: [
                    { id: 'l1', title: 'What is Web Development?', duration: '10:00', completed: false },
                    { id: 'l2', title: 'Setting Up Your Environment', duration: '15:00', completed: false },
                    { id: 'l3', title: 'Course Overview', duration: '5:00', completed: false },
                ],
            },
            {
                id: 'm2',
                title: 'HTML Fundamentals',
                lessons: [
                    { id: 'l4', title: 'HTML Structure & Syntax', duration: '20:00', completed: false },
                    { id: 'l5', title: 'Working with Text', duration: '15:00', completed: false },
                    { id: 'l6', title: 'Links and Images', duration: '18:00', completed: false },
                    { id: 'l7', title: 'Forms and Inputs', duration: '25:00', completed: false },
                ],
            },
            {
                id: 'm3',
                title: 'CSS Styling',
                lessons: [
                    { id: 'l8', title: 'CSS Basics', duration: '20:00', completed: false },
                    { id: 'l9', title: 'Flexbox Layout', duration: '30:00', completed: false },
                    { id: 'l10', title: 'CSS Grid', duration: '25:00', completed: false },
                    { id: 'l11', title: 'Responsive Design', duration: '35:00', completed: false },
                ],
            },
        ],
    };

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId],
        }));
    };

    const handleEnroll = () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll in this course');
            navigate('/login');
            return;
        }

        // TODO: Implement enrollment with Appwrite
        toast.success('Successfully enrolled!');
        navigate(`/learn/${course.id}/${course.modules[0].lessons[0].id}`);
    };

    const handleStartLearning = () => {
        navigate(`/learn/${course.id}/${course.modules[0].lessons[0].id}`);
    };

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

    return (
        <div className="py-xl">
            <div className="container">
                {/* Course Header */}
                <div className="flex flex-col gap-xl" style={{ marginBottom: 'var(--space-2xl)' }}>
                    <div style={{ flex: 1 }}>
                        <span className="badge badge--primary mb-sm">{course.category}</span>
                        <h1 className="text-3xl font-bold mb-md">{course.title}</h1>
                        <p className="text-secondary mb-lg" style={{ lineHeight: 'var(--line-height-relaxed)' }}>
                            {course.description}
                        </p>

                        {/* Course Stats */}
                        <div className="flex gap-lg flex-wrap mb-lg">
                            <div className="flex items-center gap-sm text-secondary">
                                <HiPlay size={18} />
                                <span>{totalLessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-sm text-secondary">
                                <HiUsers size={18} />
                                <span>{course.studentsCount.toLocaleString()} students</span>
                            </div>
                            <div className="flex items-center gap-sm text-secondary">
                                <HiClock size={18} />
                                <span>{course.duration}</span>
                            </div>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center gap-md mb-lg">
                            <div className="avatar">{course.instructor.avatar}</div>
                            <div>
                                <p className="text-sm text-muted">Instructor</p>
                                <p className="font-medium">{course.instructor.name}</p>
                            </div>
                        </div>

                        {/* CTA */}
                        {course.isEnrolled ? (
                            <Button variant="primary" size="lg" onClick={handleStartLearning}>
                                <HiPlay />
                                Continue Learning
                            </Button>
                        ) : (
                            <Button variant="primary" size="lg" onClick={handleEnroll}>
                                <HiPlay />
                                Enroll Now - Free
                            </Button>
                        )}
                    </div>

                    {/* Thumbnail */}
                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '16/9', maxWidth: '600px' }}>
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>

                {/* Curriculum */}
                <div>
                    <h2 className="text-2xl font-bold mb-lg">Course Curriculum</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {course.modules.map((module, index) => (
                            <div
                                key={module.id}
                                className="card"
                                style={{ padding: 0, overflow: 'hidden' }}
                            >
                                {/* Module Header */}
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--space-md) var(--space-lg)',
                                        background: 'var(--color-bg-tertiary)',
                                        color: 'var(--color-text-primary)',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div>
                                        <span className="text-muted text-sm">Module {index + 1}</span>
                                        <h3 className="font-semibold">{module.title}</h3>
                                        <span className="text-sm text-muted">{module.lessons.length} lessons</span>
                                    </div>
                                    {expandedModules[module.id] ? (
                                        <HiChevronUp size={24} />
                                    ) : (
                                        <HiChevronDown size={24} />
                                    )}
                                </button>

                                {/* Lessons List */}
                                {expandedModules[module.id] && (
                                    <div style={{ padding: 'var(--space-sm) 0' }}>
                                        {module.lessons.map((lesson, lessonIndex) => (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center gap-md"
                                                style={{
                                                    padding: 'var(--space-sm) var(--space-lg)',
                                                    borderBottom: lessonIndex < module.lessons.length - 1 ? '1px solid var(--color-border)' : 'none',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '50%',
                                                        background: lesson.completed ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {lesson.completed ? (
                                                        <HiCheck size={14} color="white" />
                                                    ) : (
                                                        <HiPlay size={12} />
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p className="text-sm">{lesson.title}</p>
                                                </div>
                                                <span className="text-sm text-muted">{lesson.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CourseDetail;
