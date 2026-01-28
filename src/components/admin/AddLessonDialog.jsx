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
    InputAdornment,
    Alert
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
    duration: z.coerce.number()
        .min(0, 'Duration cannot be negative')
        .max(86400, 'Duration cannot exceed 24 hours'), // 24 hours in seconds
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
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(addLessonSchema),
        defaultValues: {
            title: '',
            youtubeUrl: '',
            duration: 0,
            content: ''
        }
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            reset({
                title: '',
                youtubeUrl: '',
                duration: 0,
                content: ''
            });
        }
    }, [open, reset]);

    // Helper: Convert "MM:SS" or "H:MM:SS" or "123" to seconds (integer)
    const parseDurationInput = (input) => {
        if (!input) return 0;
        if (!isNaN(input)) return parseInt(input, 10);
        const parts = input.toString().split(':').map(p => parseInt(p, 10));
        if (parts.length === 2) return (parts[0] * 60) + parts[1];
        if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        return 0;
    };

    // Helper: Convert seconds to H:MM:SS or MM:SS format for display
    const formatDurationForInput = (seconds) => {
        if (!seconds || seconds === 0) return '';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Form submission handler
    const onSubmit = async (data) => {
        try {
            const lessonData = {
                title: data.title.trim(),
                youtubeUrl: data.youtubeUrl.trim(),
                duration: data.duration,
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
            handleSubmit(onSubmit)();
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
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Quick Add:</strong> Use Ctrl+Enter to save quickly. Title and YouTube URL are required.
                            </Typography>
                        </Alert>

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

                        {/* Duration */}
                        <Controller
                            name="duration"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label="Duration"
                                    fullWidth
                                    value={formatDurationForInput(field.value)}
                                    onChange={(e) => {
                                        const duration = parseDurationInput(e.target.value);
                                        field.onChange(duration);
                                    }}
                                    onBlur={field.onBlur}
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message || 'Format: MM:SS, H:MM:SS, or total seconds (e.g., 15:30 or 930)'}
                                    disabled={isSubmitting}
                                    placeholder="e.g., 15:30 or 930"
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