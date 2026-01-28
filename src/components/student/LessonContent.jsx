import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Collapse,
    Button,
    Divider,
    Chip,
    Stack,
    Link
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    MenuBook as ContentIcon,
    Lock as LockIcon,
    PlayArrow as FreeIcon
} from '@mui/icons-material';

/**
 * LessonContent Component
 * 
 * Displays lesson content with collapsible sections for better UX.
 * Handles both free and premium content display.
 * 
 * @param {Object} lesson - Lesson object with content, title, isFree, etc.
 * @param {boolean} hasAccess - Whether user has access to premium content
 * @param {boolean} defaultExpanded - Whether content should be expanded by default
 */
export function LessonContent({ lesson, hasAccess = true, defaultExpanded = false }) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    // Don't render if no content
    if (!lesson?.content?.trim()) {
        return null;
    }

    const canViewContent = lesson.isFree || hasAccess;

    // Parse content for better formatting
    const formatContent = (content) => {
        return content
            .split('\n')
            .map((line, index) => {
                // Convert URLs to clickable links
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                const parts = line.split(urlRegex);
                
                return (
                    <Typography 
                        key={index} 
                        variant="body2" 
                        sx={{ 
                            mb: line.trim() === '' ? 1 : 0.5,
                            fontWeight: line.startsWith('•') || line.startsWith('-') ? 400 : 'inherit',
                            pl: line.startsWith('•') || line.startsWith('-') ? 2 : 0
                        }}
                    >
                        {parts.map((part, partIndex) => 
                            urlRegex.test(part) ? (
                                <Link 
                                    key={partIndex} 
                                    href={part} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    sx={{ wordBreak: 'break-all' }}
                                >
                                    {part}
                                </Link>
                            ) : part
                        )}
                    </Typography>
                );
            });
    };

    return (
        <Card variant="outlined" sx={{ mt: 3, overflow: 'visible' }}>
            <Box 
                sx={{ 
                    p: 2, 
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                        bgcolor: 'action.selected'
                    }
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <ContentIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                        Lesson Content & Resources
                    </Typography>
                    <Chip 
                        icon={lesson.isFree ? <FreeIcon /> : <LockIcon />}
                        label={lesson.isFree ? "Free Preview" : "Premium"} 
                        size="small"
                        color={lesson.isFree ? "success" : "primary"}
                        variant="outlined"
                    />
                </Stack>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={expanded}>
                <Divider />
                <CardContent sx={{ p: 3 }}>
                    {canViewContent ? (
                        <Box sx={{ '& > *:last-child': { mb: 0 } }}>
                            {formatContent(lesson.content)}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <LockIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Premium Content
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                This lesson content is available for enrolled students only.
                            </Typography>
                            <Button variant="contained" size="small">
                                Enroll Now
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Collapse>
        </Card>
    );
}

export default LessonContent;