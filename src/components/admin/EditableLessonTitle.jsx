import { useState } from 'react';
import {
    IconButton,
    Box,
    Typography,
    Chip,
    Stack,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon
} from '@mui/icons-material';
import { formatDuration } from '../../lib/format';
import { LessonEditDialog } from './LessonEditDialog';

/**
 * EditableLessonTitle Component
 * 
 * Displays lesson information with edit functionality via comprehensive dialog.
 * Follows Material-UI best practices for responsive button layouts.
 * 
 * @param {Object} lesson - Lesson object
 * @param {Function} onSave - Callback when lesson is saved
 * @param {boolean} disabled - Whether editing is disabled
 */
export function EditableLessonTitle({ lesson, onSave, disabled = false }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        if (disabled) return;
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleSaveLesson = async (lessonId, updatedData) => {
        await onSave(lessonId, updatedData);
        setDialogOpen(false);
    };

    return (
        <>
            <Box 
                sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    minHeight: 48,
                    py: 1,
                    minWidth: 0, // Critical for flexbox text truncation
                }}
            >
                {/* Main Content Area */}
                <Box 
                    sx={{ 
                        flex: 1,
                        minWidth: 0, // Critical for text truncation in flexbox
                        cursor: disabled ? 'default' : 'pointer',
                        '&:hover': {
                            bgcolor: disabled ? 'transparent' : 'action.hover'
                        },
                        borderRadius: 1,
                        p: 1,
                        ml: -1,
                        transition: 'background-color 0.2s ease'
                    }}
                    onClick={handleOpenDialog}
                >
                    <Typography 
                        variant="body2" 
                        noWrap
                        sx={{ 
                            fontSize: 14, 
                            fontWeight: 500,
                            color: disabled ? 'text.disabled' : 'text.primary',
                            lineHeight: 1.3,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            wordBreak: 'break-all',
                            maxWidth: '100%'
                        }}
                        title={lesson.title} // Show full title on hover
                    >
                        {lesson.title}
                    </Typography>
                    
                    <Stack 
                        direction="row" 
                        spacing={1} 
                        alignItems="center"
                        sx={{ flexWrap: 'wrap', gap: 0.5 }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            {formatDuration(lesson.duration)}
                        </Typography>
                        {lesson.youtubeUrl && (
                            <Chip
                                label="Video"
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ height: 18, fontSize: 10 }}
                            />
                        )}
                        {lesson.content && (
                            <Chip
                                label="Content"
                                color="info"
                                variant="outlined"
                                size="small"
                                sx={{ height: 18, fontSize: 10 }}
                            />
                        )}
                    </Stack>
                </Box>
                

            </Box>

            {/* Lesson Edit Dialog */}
            <LessonEditDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                lesson={lesson}
                onSave={handleSaveLesson}
            />
        </>
    );
}

// Export the edit button component for external use in secondaryAction
EditableLessonTitle.EditButton = ({ lesson, onSave, disabled = false }) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenDialog = () => {
        if (disabled) return;
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleSaveLesson = async (lessonId, updatedData) => {
        await onSave(lessonId, updatedData);
        setDialogOpen(false);
    };

    return (
        <>
            <Tooltip title="Edit lesson">
                <IconButton
                    size="small"
                    onClick={handleOpenDialog}
                    sx={{ 
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'primary.lighter'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <LessonEditDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                lesson={lesson}
                onSave={handleSaveLesson}
            />
        </>
    );
};

export default EditableLessonTitle;