import { useState, useMemo, useEffect } from 'react';
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
import { toast } from 'sonner';
import { databases, COLLECTIONS, DATABASE_ID, Query } from '../../lib/appwrite';

// Motion wrapper
const MotionBox = MotionLibrary.create(Box);

/**
 * Courses Page
 * 
 * MUI-based course catalog with search and category filter.
 * Uses auto-animate for smooth list transitions.
 */
export function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [animateRef] = useAutoAnimate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.COURSES,
                    [
                        Query.equal('isPublished', true),
                        Query.orderDesc('$createdAt'),
                    ]
                );

                // Map Appwrite documents to our course format
                const mappedCourses = response.documents.map(doc => ({
                    id: doc.$id,
                    title: doc.title,
                    description: doc.description,
                    category: doc.category || 'General',
                    thumbnail: doc.thumbnail || 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800',
                    lessonsCount: doc.lessonsCount || 0,
                    studentsCount: doc.studentsCount || 0,
                    price: doc.price || 0,
                    instructor: doc.instructorId
                }));

                setCourses(mappedCourses);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
                toast.error('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        return ['All', ...new Set(courses.map((c) => c.category))];
    }, [courses]);

    // Filter courses based on search and category
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesSearch =
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === 'All' || course.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [courses, searchQuery, selectedCategory]);

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
