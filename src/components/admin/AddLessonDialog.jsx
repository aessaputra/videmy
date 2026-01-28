import { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    IconButton,
    Typography,
    Box,
    InputAdornment
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
    AccessTime as TimeIcon,
    YouTube as YouTubeIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parseDurationToSeconds } from '../../lib/format.js';

// Zod schema for new lesson validation
const addLessonSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters'),
    youtubeUrl: z.string()
        .min(1, 'YouTube URL is required')
        .refine((url) => {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
            return youtubeRegex.test(url);
        }, 'Please enter a valid YouTube URL'),
    durationInput: z.string()
        .refine((input) => {
            if (!input || input.trim() === '') return true;
            const seconds = parseDurationToSeconds(input);
            return seconds > 0; // Must be valid and positive
        }, 'Please enter a valid duration (MM:SS or HH:MM:SS)')
        .refine((input) => {
            if (!input || input.trim() === '') return true;
            const seconds = parseDurationToSeconds(input);
            return seconds <= 86400; // Max 24 hours (86400 seconds)
        }, 'Duration cannot exceed 24 hours')
        .transform((input) => parseDurationToSeconds(input)),
    content: z.string()
        .max(5000, 'Content cannot exceed 5000 characters')
        .optional()
});

/**
 * AddLessonDialog Component
 * 
 * Dialog for adding new lessons using React Hook Form and Zod validation.
 * Follows project patterns and Material-UI v7 best practices.
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {Function} onClose - Callback when dialog is closed
 * @param {string} moduleId - ID of the module to add lesson to
 * @param {Function} onSave - Callback when lesson is saved
 */
export function AddLessonDialog({ open, onClose, moduleId, onSave }) {
    // React Hook Form setup with Zod validation
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { isSubmitting }
    } = useForm({
        resolver: zodResolver(addLessonSchema),
        defaultValues: {
            title: '',
            youtubeUrl: '',
            durationInput: '',
            content: ''
        }
    });

    // Watch required fields for quick submit validation
    const watchedFields = watch(['title', 'youtubeUrl']);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            reset({
                title: '',
                youtubeUrl: '',
                durationInput: '',
                content: ''
            });
        }
    }, [open, reset]);

    // Form submission handler
    const onSubmit = async (data) => {
        try {
            const lessonData = {
                title: data.title.trim(),
                youtubeUrl: data.youtubeUrl.trim(),
                duration: data.durationInput, // This is already parsed to seconds by Zod transform
                content: data.content?.trim() || '',
                moduleId
            };

            await onSave(lessonData);
            toast.success('Lesson added successfully');
            onClose();
        } catch (error) {
            console.error('Add lesson failed:', error);
            toast.error('Failed to add lesson');
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            
            // Check if required fields are filled for quick submit
            const [title, youtubeUrl] = watchedFields;
            const hasRequiredFields = title?.trim().length >= 3 && youtubeUrl?.trim().length > 0;
            
            if (hasRequiredFields) {
                handleSubmit(onSubmit)();
            } else {
                toast.error('Please fill in the title (min 3 characters) and YouTube URL before using quick submit');
            }
        } else if (event.key === 'Escape') {
            event.preventDefault();
            handleClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            onKeyDown={handleKeyDown}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={600}>
                        Add New Lesson
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        disabled={isSubmitting}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {/* Lesson Title */}
                        <Controller
                            name="title"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Lesson Title"
                                    fullWidth
                                    required
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message || 'Enter a descriptive title for this lesson'}
                                    disabled={isSubmitting}
                                    autoFocus
                                    placeholder="e.g. Introduction to React Hooks"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <DescriptionIcon fontSize="small" />
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />
                            )}
                        />

                        {/* YouTube URL */}
                        <Controller
                            name="youtubeUrl"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="YouTube Video URL"
                                    fullWidth
                                    required
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message || 'Enter the full YouTube video URL'}
                                    disabled={isSubmitting}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <YouTubeIcon fontSize="small" />
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />
                            )}
                        />

                        {/* Duration*/}
                        <Controller
                            name="durationInput"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Duration"
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={
                                        fieldState.error?.message || 
                                        'Format:HH:MM:SS or MM:SS'
                                    }
                                    disabled={isSubmitting}
                                    placeholder="HH:MM:SS"
                                    inputMode="text"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <TimeIcon fontSize="small" />
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />
                            )}
                        />

                        {/* Lesson Content & Description */}
                        <Controller
                            name="content"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Lesson Content & Description"
                                    multiline
                                    minRows={4}
                                    maxRows={8}
                                    fullWidth
                                    error={!!fieldState.error}
                                    disabled={isSubmitting}
                                    placeholder="Describe what students will learn in this lesson...

📚 Learning Objectives:
• Understand the basics of...
• Learn how to implement...

🔗 Resources:
• Documentation: [link]
• Code examples: [link]

💡 Prerequisites:
• Basic knowledge of..."
                                    helperText={fieldState.error?.message || 'Add learning objectives, resources, prerequisites, or any additional context for students (optional)'}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            fontFamily: 'monospace',
                                            fontSize: '14px',
                                            lineHeight: 1.6
                                        }
                                    }}
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? null : <AddIcon />}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Lesson'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default AddLessonDialog;