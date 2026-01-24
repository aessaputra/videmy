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
} from '@mui/material';
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
                        {featuredCourses.map((course, index) => (
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
