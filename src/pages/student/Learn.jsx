import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiPlay, HiCheck, HiChevronLeft, HiChevronRight, HiMenu } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Button } from '../../components/common';
import { VideoPlayer } from '../../components/course';

/**
 * Learn Page
 * 
 * Video player with lesson navigation sidebar.
 */
export function Learn() {
    const { courseId, lessonId } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [completedLessons, setCompletedLessons] = useState(['l1']);

    // Demo course data (will be fetched from Appwrite later)
    const course = {
        id: courseId,
        title: 'Complete Web Development Bootcamp',
        modules: [
            {
                id: 'm1',
                title: 'Introduction to Web Development',
                lessons: [
                    { id: 'l1', title: 'What is Web Development?', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '10:00' },
                    { id: 'l2', title: 'Setting Up Your Environment', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '15:00' },
                    { id: 'l3', title: 'Course Overview', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '5:00' },
                ],
            },
            {
                id: 'm2',
                title: 'HTML Fundamentals',
                lessons: [
                    { id: 'l4', title: 'HTML Structure & Syntax', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '20:00' },
                    { id: 'l5', title: 'Working with Text', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '15:00' },
                    { id: 'l6', title: 'Links and Images', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '18:00' },
                ],
            },
            {
                id: 'm3',
                title: 'CSS Styling',
                lessons: [
                    { id: 'l7', title: 'CSS Basics', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '20:00' },
                    { id: 'l8', title: 'Flexbox Layout', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '30:00' },
                    { id: 'l9', title: 'CSS Grid', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: '25:00' },
                ],
            },
        ],
    };

    // Find current lesson
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
    const currentLesson = allLessons[currentLessonIndex];
    const prevLesson = allLessons[currentLessonIndex - 1];
    const nextLesson = allLessons[currentLessonIndex + 1];

    // Find current module
    const currentModule = course.modules.find(m =>
        m.lessons.some(l => l.id === lessonId)
    );

    const handleMarkComplete = () => {
        if (!completedLessons.includes(lessonId)) {
            setCompletedLessons([...completedLessons, lessonId]);
            toast.success('Lesson marked as complete!');
        }
    };

    const isLessonCompleted = (id) => completedLessons.includes(id);

    if (!currentLesson) {
        return (
            <div className="empty-state" style={{ minHeight: '80vh' }}>
                <div className="empty-state__icon">🔍</div>
                <h3 className="empty-state__title">Lesson not found</h3>
                <Link to={`/courses/${courseId}`}>
                    <Button variant="primary">Back to Course</Button>
                </Link>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Video Player */}
                <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-md)' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <VideoPlayer
                            youtubeUrl={currentLesson.youtubeUrl}
                            title={currentLesson.title}
                        />
                    </div>
                </div>

                {/* Lesson Info */}
                <div style={{ padding: 'var(--space-lg)', flex: 1 }}>
                    <div className="container" style={{ maxWidth: '1200px' }}>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-sm text-sm text-muted mb-md">
                            <Link to={`/courses/${courseId}`} style={{ color: 'var(--color-primary-light)' }}>
                                {course.title}
                            </Link>
                            <span>/</span>
                            <span>{currentModule?.title}</span>
                        </div>

                        {/* Title and Actions */}
                        <div className="flex items-start justify-between gap-lg mb-lg flex-wrap">
                            <div>
                                <h1 className="text-2xl font-bold mb-sm">{currentLesson.title}</h1>
                                <p className="text-secondary">Duration: {currentLesson.duration}</p>
                            </div>

                            <Button
                                variant={isLessonCompleted(lessonId) ? 'success' : 'primary'}
                                onClick={handleMarkComplete}
                                disabled={isLessonCompleted(lessonId)}
                            >
                                <HiCheck />
                                {isLessonCompleted(lessonId) ? 'Completed' : 'Mark Complete'}
                            </Button>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between gap-md mt-xl">
                            {prevLesson ? (
                                <Link to={`/learn/${courseId}/${prevLesson.id}`}>
                                    <Button variant="secondary">
                                        <HiChevronLeft />
                                        Previous
                                    </Button>
                                </Link>
                            ) : (
                                <div />
                            )}

                            {nextLesson ? (
                                <Link to={`/learn/${courseId}/${nextLesson.id}`}>
                                    <Button variant="primary">
                                        Next
                                        <HiChevronRight />
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/dashboard">
                                    <Button variant="success">
                                        <HiCheck />
                                        Finish Course
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Toggle (Mobile) */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: 'fixed',
                    bottom: 'var(--space-lg)',
                    right: 'var(--space-lg)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                }}
                className="hidden-desktop"
            >
                <HiMenu size={24} />
            </button>

            {/* Sidebar */}
            <aside
                className="lesson-sidebar"
                style={{
                    width: sidebarOpen ? '320px' : '0',
                    minWidth: sidebarOpen ? '320px' : '0',
                    overflow: 'hidden',
                    transition: 'all var(--transition-normal)',
                }}
            >
                {course.modules.map((module) => (
                    <div key={module.id} className="lesson-sidebar__module">
                        <div className="lesson-sidebar__module-title">
                            {module.title}
                        </div>
                        {module.lessons.map((lesson) => (
                            <Link
                                key={lesson.id}
                                to={`/learn/${courseId}/${lesson.id}`}
                                className={`lesson-sidebar__lesson ${lesson.id === lessonId ? 'lesson-sidebar__lesson--active' : ''
                                    } ${isLessonCompleted(lesson.id) ? 'lesson-sidebar__lesson--completed' : ''}`}
                            >
                                <span className="lesson-sidebar__lesson-icon">
                                    {isLessonCompleted(lesson.id) ? (
                                        <HiCheck size={16} />
                                    ) : (
                                        <HiPlay size={16} />
                                    )}
                                </span>
                                <span style={{ flex: 1 }}>{lesson.title}</span>
                                <span className="text-muted text-xs">{lesson.duration}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </aside>
        </div>
    );
}

export default Learn;
