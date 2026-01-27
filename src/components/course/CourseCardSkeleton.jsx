import {
    Card,
    CardContent,
    Skeleton,
    Box,
    Stack,
} from '@mui/material';

/**
 * Course Card Skeleton Component
 * 
 * MUI Skeleton placeholder displayed while course data is loading.
 * Mirrors the structure of CourseCard for smooth transition.
 */
export function CourseCardSkeleton() {
    return (
        <Card
            sx={{
                display: 'block',
                height: '100%',
            }}
        >
            {/* Thumbnail skeleton */}
            <Skeleton
                variant="rectangular"
                height={180}
                animation="wave"
            />

            <CardContent>
                {/* Category chip skeleton */}
                <Box sx={{ mb: 1.5 }}>
                    <Skeleton
                        variant="rounded"
                        width={80}
                        height={24}
                        animation="wave"
                    />
                </Box>

                {/* Title skeleton (2 lines) */}
                <Skeleton
                    variant="text"
                    width="100%"
                    height={32}
                    animation="wave"
                    sx={{ mb: 0.5 }}
                />
                <Skeleton
                    variant="text"
                    width="75%"
                    height={32}
                    animation="wave"
                    sx={{ mb: 1 }}
                />

                {/* Description skeleton (2 lines) */}
                <Skeleton
                    variant="text"
                    width="100%"
                    height={20}
                    animation="wave"
                />
                <Skeleton
                    variant="text"
                    width="90%"
                    height={20}
                    animation="wave"
                    sx={{ mb: 2 }}
                />

                {/* Price skeleton */}
                <Box sx={{ mb: 2 }}>
                    <Skeleton
                        variant="rounded"
                        width={100}
                        height={32}
                        animation="wave"
                    />
                </Box>

                {/* Metadata row skeleton */}
                <Stack
                    direction="row"
                    spacing={2}
                >
                    <Skeleton variant="text" width={80} height={20} animation="wave" />
                    <Skeleton variant="text" width={80} height={20} animation="wave" />
                    <Skeleton variant="text" width={60} height={20} animation="wave" />
                </Stack>
            </CardContent>
        </Card>
    );
}

export default CourseCardSkeleton;
