import { useState } from 'react';
import { HiSearch, HiFilter } from 'react-icons/hi';
import { Button, Input, motion, AnimatedSection } from '../../components/common';
import { CourseCard } from '../../components/course';
import { useListAnimation } from '../../hooks/useListAnimation';

/**
 * Courses Page
 * 
 * Course catalog with search and filter functionality.
 * Uses auto-animate for smooth list transitions when filtering.
 */
export function Courses() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Auto-animate for smooth list transitions
    const [coursesRef] = useListAnimation();

    // Demo courses (will be fetched from Appwrite later)
    const allCourses = [
        {
            id: '1',
            title: 'Complete Web Development Bootcamp',
            description: 'Belajar HTML, CSS, JavaScript, React, dan Node.js dari nol hingga mahir.',
            category: 'Web Development',
            thumbnail: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800',
            lessonsCount: 120,
            studentsCount: 2500,
        },
        {
            id: '2',
            title: 'UI/UX Design Masterclass',
            description: 'Kuasai prinsip desain dan tools seperti Figma untuk karir desainer.',
            category: 'Design',
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
            lessonsCount: 85,
            studentsCount: 1800,
        },
        {
            id: '3',
            title: 'Python for Data Science',
            description: 'Pelajari Python, Pandas, dan Machine Learning untuk analisis data.',
            category: 'Data Science',
            thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
            lessonsCount: 95,
            studentsCount: 3200,
        },
        {
            id: '4',
            title: 'React Native Mobile Development',
            description: 'Bangun aplikasi mobile cross-platform dengan React Native.',
            category: 'Mobile Development',
            thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
            lessonsCount: 78,
            studentsCount: 1500,
        },
        {
            id: '5',
            title: 'Digital Marketing Fundamentals',
            description: 'Pelajari strategi marketing digital, SEO, dan social media.',
            category: 'Marketing',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            lessonsCount: 45,
            studentsCount: 2100,
        },
        {
            id: '6',
            title: 'JavaScript Advanced Concepts',
            description: 'Kuasai konsep advanced JavaScript: closures, promises, async/await.',
            category: 'Web Development',
            thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
            lessonsCount: 65,
            studentsCount: 1900,
        },
    ];

    // Get unique categories
    const categories = ['all', ...new Set(allCourses.map(course => course.category))];

    // Filter courses based on search and category
    const filteredCourses = allCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="py-xl">
            <div className="container">
                {/* Header - Animated */}
                <motion.div
                    className="mb-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold mb-sm">All Courses</h1>
                    <p className="text-secondary">
                        Temukan kursus yang sesuai dengan minat dan tujuan karir Anda
                    </p>
                </motion.div>

                {/* Search and Filter - Animated */}
                <motion.div
                    className="flex flex-col gap-md mb-xl"
                    style={{ maxWidth: '100%' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div style={{ flex: 1 }}>
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

                    <div className="flex gap-sm flex-wrap">
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category === 'all' ? 'All Categories' : category}
                            </Button>
                        ))}
                    </div>
                </motion.div>

                {/* Results count */}
                <p className="text-secondary text-sm mb-lg">
                    Showing {filteredCourses.length} of {allCourses.length} courses
                </p>

                {/* Course Grid - Auto-animated for smooth filtering */}
                {filteredCourses.length > 0 ? (
                    <div ref={coursesRef} className="courses-grid">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        className="empty-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="empty-state__icon">🔍</div>
                        <h3 className="empty-state__title">No courses found</h3>
                        <p className="empty-state__desc">
                            Try adjusting your search or filter to find what you're looking for.
                        </p>
                        <Button variant="secondary" onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                        }}>
                            Clear Filters
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default Courses;
