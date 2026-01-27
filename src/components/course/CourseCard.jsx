import { Link } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Chip,
    Box,
    Stack,
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    People as PeopleIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';

/**
 * Format price to Indonesian Rupiah
 * @param {number} price - Price in IDR
 * @returns {string} Formatted price string
 */
const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

/**
 * Course Card Component
 * 
 * MUI-based card displaying course preview with thumbnail, title, and metadata.
 * 
 * @param {Object} props
 * @param {Object} props.course - Course data object
 */
export function CourseCard({ course }) {
    const {
        id,
        title,
        description,
        category,
        thumbnail,
        lessonsCount = 0,
        studentsCount = 0,
        duration,
        price = 0,
    } = course;

    // Generate placeholder thumbnail if none provided
    const imageUrl = thumbnail || `https://via.placeholder.com/800x450/0d9488/ffffff?text=${encodeURIComponent(title)}`;

    // Determine if course is free
    const isFree = !price || price === 0;

    return (
        <Card
            component={Link}
            to={`/courses/${id}`}
            sx={{
                display: 'block',
                textDecoration: 'none',
                height: '100%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                },
            }}
        >
            <CardMedia
                component="img"
                height="180"
                image={imageUrl}
                alt={title}
                sx={{
                    objectFit: 'cover',
                }}
            />

            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    {category && (
                        <Chip
                            label={category}
                            size="small"
                            color="primary"
                        />
                    )}
                </Box>

                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1,
                        minHeight: 56,
                    }}
                >
                    {title}
                </Typography>

                {description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mb: 2,
                            minHeight: 40,
                        }}
                    >
                        {description}
                    </Typography>
                )}

                {/* Price Display */}
                <Box sx={{ mb: 2 }}>
                    {isFree ? (
                        <Chip
                            label="Free"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 600 }}
                        />
                    ) : (
                        <Typography
                            variant="h6"
                            color="primary"
                            fontWeight={700}
                        >
                            {formatPrice(price)}
                        </Typography>
                    )}
                </Box>

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ color: 'text.secondary' }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlayIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                            {lessonsCount} lessons
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                            {studentsCount.toLocaleString()} students
                        </Typography>
                    </Box>
                    {duration && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimeIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">{duration}</Typography>
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default CourseCard;

