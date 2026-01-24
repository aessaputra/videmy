import { Link } from 'react-router-dom';
import { HiPlay, HiUsers, HiAcademicCap, HiLightningBolt } from 'react-icons/hi';
import {
    Button,
    AnimatedSection,
    StaggerContainer,
    StaggerItem,
    motion
} from '../../components/common';
import { CourseCard } from '../../components/course';

/**
 * Home Page
 * 
 * Landing page with hero section and featured courses.
 * Uses Motion for smooth scroll-based animations.
 */
export function Home() {
    // Demo featured courses (will be fetched from Appwrite later)
    const featuredCourses = [
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
    ];

    const stats = [
        { icon: HiPlay, value: '500+', label: 'Video Lessons' },
        { icon: HiUsers, value: '10K+', label: 'Students' },
        { icon: HiAcademicCap, value: '50+', label: 'Courses' },
        { icon: HiLightningBolt, value: '100%', label: 'Free Access' },
    ];

    return (
        <>
            {/* Hero Section - Animated on load */}
            <section className="hero">
                <div className="container">
                    <motion.h1
                        className="hero__title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Tingkatkan Skill Anda dengan{' '}
                        <span className="hero__title-gradient">Video Berkualitas</span>
                    </motion.h1>
                    <motion.p
                        className="hero__subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Platform kursus online berbasis video YouTube.
                        Belajar dari instruktur terbaik, gratis selamanya.
                    </motion.p>
                    <motion.div
                        className="hero__actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Link to="/courses">
                            <Button variant="primary" size="lg">
                                <HiPlay />
                                Mulai Belajar
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="secondary" size="lg">
                                Daftar Gratis
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section - Staggered animation on scroll */}
            <AnimatedSection className="py-2xl">
                <div className="container">
                    <StaggerContainer className="dashboard__stats">
                        {stats.map((stat, index) => (
                            <StaggerItem key={index}>
                                <div className="stat-card">
                                    <stat.icon size={32} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
                                    <div className="stat-card__value">{stat.value}</div>
                                    <div className="stat-card__label">{stat.label}</div>
                                </div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </AnimatedSection>

            {/* Featured Courses - Staggered animation */}
            <AnimatedSection className="py-2xl" style={{ background: 'var(--color-bg-secondary)' }}>
                <div className="container">
                    <div className="mb-xl" style={{ textAlign: 'center' }}>
                        <h2 className="text-3xl font-bold mb-sm">Featured Courses</h2>
                        <p className="text-secondary">Kursus populer pilihan kami untuk Anda</p>
                    </div>

                    <StaggerContainer className="courses-grid">
                        {featuredCourses.map((course) => (
                            <StaggerItem key={course.id}>
                                <CourseCard course={course} />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>

                    <motion.div
                        className="mt-xl"
                        style={{ textAlign: 'center' }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link to="/courses">
                            <Button variant="secondary" size="lg">
                                Lihat Semua Kursus
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </AnimatedSection>

            {/* CTA Section - Fade in on scroll */}
            <AnimatedSection className="py-3xl" delay={0.2}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 className="text-3xl font-bold mb-md">
                        Siap untuk memulai perjalanan belajar Anda?
                    </h2>
                    <p className="text-secondary text-lg mb-xl" style={{ maxWidth: '600px', margin: '0 auto var(--space-xl)' }}>
                        Bergabung dengan ribuan pelajar lainnya dan mulai tingkatkan
                        skill Anda hari ini. 100% gratis, selamanya.
                    </p>
                    <Link to="/register">
                        <Button variant="primary" size="lg">
                            <HiAcademicCap />
                            Daftar Sekarang
                        </Button>
                    </Link>
                </div>
            </AnimatedSection>
        </>
    );
}

export default Home;
