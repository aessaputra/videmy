import { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Stack,
    Link,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    MenuBook as ContentIcon,
    Lock as LockIcon
} from '@mui/icons-material';

/**
 * LessonContent Component
 * 
 * Displays lesson content with collapsible sections for better UX.
 * Handles both free and premium content display with proper access control.
 * 
 * @param {Object} lesson - Lesson object with content, title, isFree, etc.
 * @param {boolean} hasAccess - Whether user has access to premium content
 * @param {boolean} defaultExpanded - Whether content should be expanded by default
 */
export function LessonContent({ lesson, hasAccess = true, defaultExpanded = false }) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const hasContent = lesson?.content?.trim();
    const canViewContent = lesson?.isFree || hasAccess;

    // Handle accordion change
    const handleChange = (event, isExpanded) => {
        setExpanded(isExpanded);
    };

    // Parse content for better formatting with memoization and responsive design
    const formatContent = useMemo(() => {
        if (!hasContent) return null;
        
        return lesson.content
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
                            mb: line.trim() === '' ? { xs: 0.75, sm: 1 } : { xs: 0.375, sm: 0.5 },
                            fontWeight: line.startsWith('•') || line.startsWith('-') ? 400 : 'inherit',
                            pl: line.startsWith('•') || line.startsWith('-') ? { xs: 1.5, sm: 2 } : 0,
                            fontSize: { xs: '0.875rem', sm: '0.875rem' },
                            lineHeight: { xs: 1.5, sm: 1.6 }
                        }}
                    >
                        {parts.map((part, partIndex) => 
                            urlRegex.test(part) ? (
                                <Link 
                                    key={partIndex} 
                                    href={part} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    sx={{ 
                                        wordBreak: 'break-all',
                                        fontSize: { xs: '0.875rem', sm: '0.875rem' }
                                    }}
                                >
                                    {part}
                                </Link>
                            ) : part
                        )}
                    </Typography>
                );
            });
    }, [hasContent, lesson.content, isSmallScreen]);

    return (
        <Accordion 
            expanded={expanded}
            onChange={handleChange}
            sx={{ 
                mt: 3,
                mb: 1,
                boxShadow: 'none !important',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: { xs: 1, sm: 2 },
                '&:before': {
                    display: 'none',
                },
                '&.Mui-expanded': {
                    margin: '24px 0 8px 0',
                },
            }}
        >
            <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    minHeight: { xs: 48, sm: 56 },
                    '&.Mui-expanded': {
                        minHeight: { xs: 48, sm: 56 },
                    },
                    '& .MuiAccordionSummary-content': {
                        margin: { xs: '8px 0', sm: '12px 0' },
                        '&.Mui-expanded': {
                            margin: { xs: '8px 0', sm: '12px 0' },
                        },
                    },
                }}
            >
                <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={isMobile ? 1.5 : 2}
                    sx={{ flex: 1 }}
                >
                    <ContentIcon 
                        color="primary" 
                        sx={{ 
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                        }} 
                    />
                    <Box>
                        <Typography 
                            variant={isSmallScreen ? "subtitle1" : "h6"} 
                            fontWeight={600}
                            sx={{
                                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                                lineHeight: 1.2
                            }}
                        >
                            Lesson Content & Description
                        </Typography>
                    </Box>
                </Stack>
            </AccordionSummary>
            
            <AccordionDetails sx={{ 
                p: { xs: 2, sm: 3 },
                pt: 0,
            }}>
                {canViewContent ? (
                    hasContent ? (
                        <Box sx={{ 
                            '& > *:last-child': { mb: 0 },
                            '& p': {
                                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                                lineHeight: { xs: 1.5, sm: 1.6 }
                            },
                            '& a': {
                                fontSize: { xs: '0.875rem', sm: '0.875rem' }
                            }
                        }}>
                            {formatContent}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: { xs: 2, sm: 3 } }}>
                            <ContentIcon sx={{ 
                                fontSize: { xs: 40, sm: 48 }, 
                                color: 'text.disabled', 
                                mb: { xs: 1.5, sm: 2 } 
                            }} />
                            <Typography 
                                variant={isSmallScreen ? "subtitle1" : "h6"} 
                                color="text.secondary" 
                                gutterBottom
                                sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                            >
                                No Additional Content
                            </Typography>
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                    fontSize: { xs: '0.875rem', sm: '0.875rem' },
                                    px: { xs: 1, sm: 0 }
                                }}
                            >
                                This lesson doesn't have additional written content or resources yet.
                            </Typography>
                        </Box>
                    )
                ) : (
                    <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                        <LockIcon sx={{ 
                            fontSize: { xs: 40, sm: 48 }, 
                            color: 'text.disabled', 
                            mb: { xs: 1.5, sm: 2 } 
                        }} />
                        <Typography 
                            variant={isSmallScreen ? "subtitle1" : "h6"} 
                            color="text.secondary" 
                            gutterBottom
                            sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                        >
                            Premium Content
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            paragraph
                            sx={{ 
                                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                                px: { xs: 1, sm: 0 },
                                mb: { xs: 2, sm: 3 }
                            }}
                        >
                            This lesson content is available for enrolled students only.
                        </Typography>
                        <Button 
                            variant="contained" 
                            size={isSmallScreen ? "medium" : "large"}
                            sx={{
                                minWidth: { xs: 120, sm: 140 },
                                fontSize: { xs: '0.875rem', sm: '0.875rem' }
                            }}
                        >
                            Enroll Now
                        </Button>
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    );
}

export default LessonContent;