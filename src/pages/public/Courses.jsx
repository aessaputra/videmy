import { useState, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Grid,
    Chip,
    Stack,
    InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { motion as MotionLibrary } from 'motion/react';
import { CourseCard } from '../../components/course';
import { useAutoAnimate } from '@formkit/auto-animate/react';

// Motion wrapper
const MotionBox = MotionLibrary.create(Box);

/**
 * Courses Page
 * 
 * MUI-based course catalog with search and category filter.
 * Uses auto-animate for smooth list transitions.
 */
export function Courses() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [animateRef] = useAutoAnimate();

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
            title: 'Mobile App Development with React Native',
            description: 'Bangun aplikasi mobile cross-platform dengan React Native.',
            category: 'Mobile Development',
            thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
            lessonsCount: 78,
            studentsCount: 1500,
        },
        {
            id: '5',
            title: 'Digital Marketing Complete Guide',
            description: 'Strategi pemasaran digital dari SEO hingga Social Media Marketing.',
            category: 'Marketing',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            lessonsCount: 65,
            studentsCount: 2100,
        },
        {
            id: '6',
            title: 'Advanced JavaScript Patterns',
            description: 'Design patterns dan praktik terbaik untuk JavaScript modern.',
            category: 'Web Development',
            thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
            lessonsCount: 45,
            studentsCount: 980,
        },
    ];

    // Get unique categories
    const categories = ['All', ...new Set(allCourses.map((c) => c.category))];

    // Filter courses based on search and category
    const filteredCourses = useMemo(() => {
        return allCourses.filter((course) => {
            const matchesSearch =
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === 'All' || course.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    return (
        <Box sx={{ py: { xs: 4, md: 6 } }}>
            <Container maxWidth="lg">
                {/* Page Header */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{ mb: 4 }}
                >
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                        All Courses
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Temukan kursus yang sesuai dengan minat dan kebutuhan Anda
                    </Typography>
                </MotionBox>

                {/* Search and Filter */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    sx={{ mb: 4 }}
                >
                    <TextField
                        fullWidth
                        placeholder="Cari kursus..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 3 }}
                    />

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                onClick={() => setSelectedCategory(category)}
                                color={selectedCategory === category ? 'primary' : 'default'}
                                variant={selectedCategory === category ? 'filled' : 'outlined'}
                                sx={{ mb: 1 }}
                            />
                        ))}
                    </Stack>
                </MotionBox>

                {/* Course Grid with auto-animate */}
                <Grid container spacing={3} ref={animateRef}>
                    {filteredCourses.map((course) => (
                        <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <CourseCard course={course} />
                        </Grid>
                    ))}

                    {filteredCourses.length === 0 && (
                        <Grid size={12}>
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 8,
                                    color: 'text.secondary',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    Tidak ada kursus ditemukan
                                </Typography>
                                <Typography variant="body2">
                                    Coba ubah kata kunci pencarian atau filter kategori
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
}

export default Courses;
