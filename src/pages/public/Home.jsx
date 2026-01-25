import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Stack,
    Skeleton,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { databases, COLLECTIONS, DATABASE_ID, Query } from '../../lib/appwrite';
import {
    PlayArrow as PlayIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    Bolt as BoltIcon,
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { CourseCard } from '../../components/course';

// Motion components
const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

/**
 * Home Page
 * 
 * Landing page with hero section and featured courses.
 * Uses Motion for smooth scroll-based animations.
 */
export function Home() {
    // State for courses
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedCourses = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.COURSES,
                    [
                        Query.equal('isPublished', true),
                        Query.orderDesc('studentsCount'), // Most popular
                        Query.limit(3)
                    ]
                );

                // Map to ensure consistent data structure if needed
                // But dependent on CourseCard expectation.
                // Assuming CourseCard handles Appwrite doc structure or we map it.
                // Let's inspect CourseCard briefly or map it to match the dummy structure:
                const courses = response.documents.map(doc => ({
                    id: doc.$id,
                    title: doc.title,
                    description: doc.description,
                    category: doc.category,
                    thumbnail: doc.thumbnail,
                    lessonsCount: doc.lessonsCount,
                    studentsCount: doc.studentsCount,
                    price: doc.price
                }));

                setFeaturedCourses(courses);
            } catch (error) {
                console.error('Failed to load featured courses:', error);
                // Fallback to empty or show error
                setFeaturedCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedCourses();
    }, []);

    const stats = [
        { icon: PlayIcon, value: '500+', label: 'Video Lessons' },
        { icon: PeopleIcon, value: '10K+', label: 'Students' },
        { icon: SchoolIcon, value: '50+', label: 'Courses' },
        { icon: BoltIcon, value: '100%', label: 'Free Access' },
    ];

    return (
        <>
            {/* Hero Section */}
            <Box
                sx={{
                    py: { xs: 8, md: 12 },
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(180deg, rgba(20, 184, 166, 0.1) 0%, transparent 100%)'
                            : 'linear-gradient(180deg, rgba(20, 184, 166, 0.05) 0%, transparent 100%)',
                }}
            >
                <Container maxWidth="md">
                    <Box textAlign="center">
                        <MotionTypography
                            variant="h2"
                            component="h1"
                            fontWeight={700}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            sx={{ mb: 2 }}
                        >
                            Tingkatkan Skill Anda dengan{' '}
                            <Typography
                                component="span"
                                variant="h2"
                                fontWeight={700}
                                color="primary"
                            >
                                Video Berkualitas
                            </Typography>
                        </MotionTypography>

                        <MotionTypography
                            variant="h6"
                            color="text.secondary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
                        >
                            Platform kursus online berbasis video YouTube.
                            Belajar dari instruktur terbaik, gratis selamanya.
                        </MotionTypography>

                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                justifyContent="center"
                            >
                                <Button
                                    component={Link}
                                    to="/courses"
                                    variant="contained"
                                    size="large"
                                    startIcon={<PlayIcon />}
                                >
                                    Mulai Belajar
                                </Button>
                                <Button
                                    component={Link}
                                    to="/register"
                                    variant="outlined"
                                    size="large"
                                    color="primary"
                                >
                                    Daftar Gratis
                                </Button>
                            </Stack>
                        </MotionBox>
                    </Box>
                </Container>
            </Box>

            {/* Stats Section */}
            <Box sx={{ py: 6 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3}>
                        {stats.map((stat, index) => (
                            <Grid key={index} size={{ xs: 6, md: 3 }}>
                                <MotionBox
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card
                                        sx={{
                                            textAlign: 'center',
                                            py: 3,
                                            '&:hover': { transform: 'none' },
                                        }}
                                    >
                                        <CardContent>
                                            <stat.icon
                                                sx={{
                                                    fontSize: 40,
                                                    color: 'primary.main',
                                                    mb: 1,
                                                }}
                                            />
                                            <Typography variant="h4" fontWeight={700}>
                                                {stat.value}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {stat.label}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </MotionBox>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Featured Courses Section */}
            <Box sx={{ py: 8, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={6}>
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Featured Courses
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Kursus populer pilihan kami untuk Anda
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {loading ? (
                            // Loading Skeletons
                            Array.from(new Array(3)).map((_, index) => (
                                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Card>
                                        <Skeleton variant="rectangular" height={200} />
                                        <CardContent>
                                            <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                                            <Skeleton variant="text" width="60%" />
                                            <Skeleton variant="text" width="40%" />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        ) : featuredCourses.map((course, index) => (
                            <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <MotionBox
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <CourseCard course={course} />
                                </MotionBox>
                            </Grid>
                        ))}

                        {!loading && featuredCourses.length === 0 && (
                            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">Belum ada kursus unggulan saat ini.</Typography>
                            </Box>
                        )}
                    </Grid>

                    <Box textAlign="center" mt={6}>
                        <Button
                            component={Link}
                            to="/courses"
                            variant="outlined"
                            size="large"
                        >
                            Lihat Semua Kursus
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: 10 }}>
                <Container maxWidth="md">
                    <MotionBox
                        textAlign="center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Siap untuk memulai perjalanan belajar Anda?
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
                        >
                            Bergabung dengan ribuan pelajar lainnya dan mulai tingkatkan
                            skill Anda hari ini. 100% gratis, selamanya.
                        </Typography>
                        <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            size="large"
                            startIcon={<SchoolIcon />}
                        >
                            Daftar Sekarang
                        </Button>
                    </MotionBox>
                </Container>
            </Box>
        </>
    );
}

export default Home;
