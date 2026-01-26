import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { Construction as ConstructionIcon } from '@mui/icons-material';

/**
 * Coming Soon Component
 * 
 * Reusable placeholder for pages under development.
 * Best practice: Shows feature scope while indicating work in progress.
 */
export function ComingSoon({
    title = 'Coming Soon',
    description = 'This feature is currently under development.',
    icon,
    showBackButton = true,
    backTo = '/dashboard',
    backLabel = 'Back to Dashboard'
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                p: 3,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, md: 6 },
                    textAlign: 'center',
                    maxWidth: 480,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {/* Icon */}
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        mb: 3,
                        '& .MuiSvgIcon-root': {
                            fontSize: 40,
                        },
                    }}
                >
                    {icon || <ConstructionIcon />}
                </Box>

                {/* Title */}
                <Typography
                    variant="h4"
                    component="h1"
                    fontWeight={700}
                    gutterBottom
                >
                    {title}
                </Typography>

                {/* Description */}
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}
                >
                    {description}
                </Typography>

                {/* Status Badge */}
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText',
                        mb: 4,
                    }}
                >
                    <ConstructionIcon fontSize="small" />
                    <Typography variant="caption" fontWeight={600}>
                        Under Development
                    </Typography>
                </Box>

                {/* Back Button */}
                {showBackButton && (
                    <Stack direction="row" justifyContent="center">
                        <Button
                            component={Link}
                            to={backTo}
                            variant="outlined"
                            size="large"
                        >
                            {backLabel}
                        </Button>
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}

export default ComingSoon;
