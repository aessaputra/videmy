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
    useTheme,
    alpha,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { databases, COLLECTIONS, DATABASE_ID, Query } from '../../lib/appwrite';
import {
    PlayArrow as PlayIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    Bolt as BoltIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { motion } from 'motion/react';
import { CourseCard } from '../../components/course';
import HeroImage from '../../assets/images/hero_3d.webp';

// Motion components
const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);
const MotionGrid = motion.create(Grid);

// Brandfetch Logos (CDN)
const BRANDS = [
    { name: 'Google', domain: 'google.com' },
    { name: 'Microsoft', domain: 'microsoft.com' },
    { name: 'Gojek', domain: 'gojek.com' },
    { name: 'Tokopedia', domain: 'tokopedia.com' },
    { name: 'Spotify', domain: 'spotify.com' },
];

/**
 * Home Page
 * 
 * Premium Landing Page with Split Hero, 3D Assets, and Social Proof.
 */
export function Home() {
    const theme = useTheme();
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
                        Query.orderDesc('studentsCount'),
                        Query.limit(3)
                    ]
                );

                const courses = response.documents.map(doc => ({
                    id: doc.$id,
                    title: doc.title,
                    description: doc.description,
                    category: doc.category,
                    thumbnail: doc.thumbnail,
                    lessonsCount: doc.lessonsCount,
                    studentsCount: doc.studentsCount,
                    price: doc.price,
                    instructorId: doc.instructorId
                }));

                setFeaturedCourses(courses);
            } catch (error) {
                console.error('Failed to load featured courses:', error);
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
        <Box sx={{ overflowX: 'hidden' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    pt: { xs: 2, md: 2 },
                    pb: { xs: 8, md: 12 },
                    bgcolor: 'background.default',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100%',
                        height: '100%',
                        background: theme.palette.mode === 'dark'
                            ? `radial-gradient(circle at 80% 20%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%)`
                            : `radial-gradient(circle at 80% 20%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 50%)`,
                        zIndex: 0,
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6} alignItems="center">
                        {/* Hero Text */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <MotionBox
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Typography
                                    variant="overline"
                                    color="primary"
                                    fontWeight={700}
                                    sx={{ letterSpacing: 2, mb: 2, display: 'block' }}
                                >
                                    LEARN WITHOUT LIMITS
                                </Typography>
                                <Typography
                                    variant="h1"
                                    fontWeight={800}
                                    sx={{
                                        fontSize: { xs: '2.5rem', md: '3.75rem' },
                                        lineHeight: 1.1,
                                        mb: 3,
                                        background: `linear-gradient(to right, ${theme.vars?.palette.text.primary || theme.palette.text.primary}, ${theme.vars?.palette.primary.main || theme.palette.primary.main})`,

                                        // Critical for Gradient Text
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        color: 'transparent',

                                        // Standard block display for Typography
                                        display: 'block',
                                        width: 'fit-content', // Wrap gradient to text width
                                    }}
                                >
                                    Tingkatkan Skill dengan <br />
                                    <Box component="span" sx={{
                                        display: 'inline', // Flow naturally with parent
                                        // Inherited gradient properties work best on inline text
                                    }}>
                                        Mentoring Harian
                                    </Box>
                                </Typography>
                                <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    sx={{ mb: 5, maxWidth: 500, lineHeight: 1.6, fontWeight: 400 }}
                                >
                                    Platform belajar online gratis dengan materi berkualitas.
                                    Akses ratusan video tutorial dari instruktur terbaik.
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button
                                        component={Link}
                                        to="/courses"
                                        variant="contained"
                                        size="large"
                                        startIcon={<PlayIcon />}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1rem',
                                            borderRadius: 3,
                                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                                        }}
                                    >
                                        Mulai Belajar
                                    </Button>
                                    <Button
                                        component={Link}
                                        to="/register"
                                        variant="outlined"
                                        size="large"
                                        endIcon={<ArrowIcon />}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1rem',
                                            borderRadius: 3,
                                        }}
                                    >
                                        Daftar Akun
                                    </Button>
                                </Stack>

                                {/* Simple Trust Indicator */}
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                    spacing={2}
                                    sx={{ mt: 4 }}
                                >
                                    <Box sx={{ display: 'flex' }}>
                                        {[1, 2, 3, 4].map((item, index) => (
                                            <Box
                                                key={item}
                                                component="img"
                                                src={`https://i.pravatar.cc/100?img=${item + 10}`}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    border: `2px solid ${theme.palette.background.default}`,
                                                    ml: index === 0 ? 0 : -1.5
                                                }}
                                            />
                                        ))}
                                    </Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        Bergabung dengan <Box component="span" color="primary.main">10.000+</Box> pelajar
                                    </Typography>
                                </Stack>
                            </MotionBox>
                        </Grid>

                        {/* Hero Image */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: 0,
                                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                                        filter: 'blur(40px)',
                                        zIndex: -1,
                                    }
                                }}
                            >
                                <Box
                                    component="img"
                                    src={HeroImage}
                                    alt="3D Student Learning"
                                    sx={{
                                        width: '100%',
                                        maxWidth: 600,
                                        height: 'auto',
                                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.1))',
                                        animation: 'float 6s ease-in-out infinite',
                                        '@keyframes float': {
                                            '0%, 100%': { transform: 'translateY(0)' },
                                            '50%': { transform: 'translateY(-20px)' },
                                        }
                                    }}
                                />
                            </MotionBox>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Trusted By Section (Brandfetch) */}
            <Box sx={{ py: 6, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="body2"
                        textAlign="center"
                        color="text.secondary"
                        sx={{ mb: 4, textTransform: 'uppercase', letterSpacing: 1 }}
                    >
                        Dipercaya oleh pelajar dari perusahaan teknologi terkemuka
                    </Typography>
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        justifyContent="center"
                        alignItems="center"
                        gap={{ xs: 3, md: 8 }}
                    >
                        {BRANDS.map((brand, index) => (
                            <MotionBox
                                key={brand.name}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                    sx={{
                                        opacity: 0.8,
                                        transition: 'all 0.3s ease-in-out',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            opacity: 1,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={`https://cdn.brandfetch.io/${brand.domain}/type/symbol`}
                                        alt={brand.name}
                                        loading="lazy"
                                        sx={{
                                            height: { xs: 24, md: 32 },
                                            width: 'auto',
                                            display: 'block',
                                            mixBlendMode: theme.palette.mode === 'light' ? 'multiply' : 'normal',
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <Typography
                                        variant="h6"
                                        color="text.primary"
                                        fontWeight={600}
                                        sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                                    >
                                        {brand.name}
                                    </Typography>
                                </Stack>
                            </MotionBox>
                        ))}
                    </Stack>
                </Container>
            </Box>

            {/* Featured Courses Section */}
            <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={6}>
                        <Typography variant="overline" color="primary" fontWeight={700}>
                            POPULAR COURSES
                        </Typography>
                        <Typography variant="h3" fontWeight={700} gutterBottom>
                            Featured Courses
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                            Mulai belajar dari skill paling diminati tahun ini.
                            Dipilih langsung oleh instruktur expert kami.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {loading ? (
                            Array.from(new Array(3)).map((_, index) => (
                                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Card sx={{ height: '100%' }}>
                                        <Skeleton variant="rectangular" height={220} />
                                        <CardContent>
                                            <Skeleton width="60%" height={32} sx={{ mb: 1 }} />
                                            <Skeleton width="40%" />
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
                                    sx={{ height: '100%' }}
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
                            size="large"
                            variant="outlined"
                            sx={{ borderRadius: 3, px: 4 }}
                        >
                            Lihat Semua Kursus
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: 12 }}>
                <Container maxWidth="lg">
                    <Card
                        sx={{
                            background: theme.palette.mode === 'dark'
                                ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 100%)`
                                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white',
                            borderRadius: 4,
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: 'url("/patterns/overlay.png")', // Optional pattern
                                opacity: 0.1
                            }}
                        />
                        <Grid container alignItems="center">
                            <Grid size={{ xs: 12, md: 8 }} sx={{ p: { xs: 4, md: 8 }, zIndex: 1 }}>
                                <Typography variant="h3" fontWeight={700} gutterBottom>
                                    Siap Memulai Karir Tech Anda?
                                </Typography>
                                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
                                    Akses materi premium secara gratis dan bangun portofolio Anda sekarang juga.
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/register"
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    sx={{
                                        color: theme.palette.primary.main,
                                        bgcolor: 'white',
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 700,
                                        '&:hover': { bgcolor: alpha('#fff', 0.9) }
                                    }}
                                >
                                    Daftar Gratis Sekarang
                                </Button>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }} sx={{
                                display: { xs: 'none', md: 'flex' },
                                justifyContent: 'center',
                                alignItems: 'center',
                                p: 4
                            }}>
                                <BoltIcon sx={{ fontSize: 200, opacity: 0.2, color: 'white' }} />
                            </Grid>
                        </Grid>
                    </Card>
                </Container>
            </Box>
        </Box>
    );
}

export default Home;
