import React, { useEffect } from 'react';
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
    Save as SaveIcon,
    AccessTime as TimeIcon,
    YouTube as YouTubeIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for lesson validation
const lessonSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters'),
    youtubeUrl: z.string()
        .min(1, 'YouTube URL is required')
        .refine((url) => {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
            return youtubeRegex.test(url);
        }, 'Please enter a valid YouTube URL'),
    duration: z.number()
        .min(0, 'Duration cannot be negative')
        .max(86400, 'Duration cannot exceed 24 hours'), // 24 hours in seconds
    content: z.string()
        .max(5000, 'Content cannot exceed 5000 characters')
        .optional()
});

/**
 * LessonEditDialog Component
 * 
 * Comprehensive dialog for editing all lesson properties using React Hook Form and Zod validation.
 * Follows project patterns and Material-UI v7 best practices.
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {Function} onClose - Callback when dialog is closed
 * @param {Object} lesson - Lesson object to edit
 * @param {Function} onSave - Callback when lesson is saved
 */
export function LessonEditDialog({ open, onClose, lesson, onSave }) {
    // React Hook Form setup with Zod validation
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty }
    } = useForm({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            title: '',
            youtubeUrl: '',
            duration: 0,
            content: ''
        }
    });

    // Initialize form data when lesson changes
    useEffect(() => {
        if (lesson && open) {
            reset({
                title: lesson.title || '',
                youtubeUrl: lesson.youtubeUrl || '',
                duration: lesson.duration || 0,
                content: lesson.content || ''
            });
        }
    }, [lesson, open, reset]);

    // Helper: Convert input to seconds with HOUR-BASED logic
    const parseDurationInput = (input) => {
        if (!input) return 0;
        
        // Pure number without colons
        if (!isNaN(input)) {
            const num = parseInt(input, 10);
            // If number > 59, treat as seconds (e.g., 930 seconds)
            // If number <= 59, treat as hours (e.g., 3 = 3 hours)
            if (num > 59) return num;
            return num * 3600; // Convert hours to seconds
        }
        
        const parts = input.toString().split(':').map(p => parseInt(p, 10));
        
        // Validate time parts
        if (parts.some(p => isNaN(p) || p < 0)) return 0;
        
        if (parts.length === 2) {
            // h:m format (hours:minutes)
            const [h, m] = parts;
            if (m >= 60) return 0; // Invalid minutes
            return (h * 3600) + (m * 60);
        }
        if (parts.length === 3) {
            // h:m:s format (hours:minutes:seconds)
            const [h, m, s] = parts;
            if (m >= 60 || s >= 60) return 0; // Invalid minutes or seconds
            return (h * 3600) + (m * 60) + s;
        }
        return 0;
    };

    // Helper: Convert seconds to most appropriate display format
    const formatDurationForInput = (seconds) => {
        if (!seconds || seconds === 0) return '';
        
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        // If we have hours, show in h:m:s or h:m format
        if (h > 0) {
            if (s > 0) {
                // Full h:m:s format when seconds are present
                return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            } else {
                // h:m format when no seconds
                return `${h}:${m.toString().padStart(2, '0')}`;
            }
        }
        
        // If no hours but have minutes, show m:s
        if (m > 0) {
            return `${m}:${s.toString().padStart(2, '0')}`;
        }
        
        // Just seconds
        return s.toString();
    };

    // Form submission handler
    const onSubmit = async (data) => {
        try {
            const updatedData = {
                title: data.title.trim(),
                youtubeUrl: data.youtubeUrl.trim(),
                duration: data.duration,
                content: data.content?.trim() || ''
            };

            await onSave(lesson.$id, updatedData);
            toast.success('Lesson updated successfully');
            onClose();
        } catch (error) {
            console.error('Save lesson failed:', error);
            toast.error('Failed to update lesson');
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
                        Edit Lesson
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
                                <strong>Editing Tips:</strong> Use Ctrl+Enter to save quickly. All fields are required except content.
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
                                    helperText={fieldState.error?.message || 'Enter the full YouTube video URL (e.g., https://www.youtube.com/watch?v=...)'}
                                    disabled={isSubmitting}
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
                            render={({ field, fieldState }) => {
                                // Enhanced state management for natural typing flow with auto-formatting
                                const [displayValue, setDisplayValue] = React.useState(() => 
                                    formatDurationForInput(field.value)
                                );
                                const [isTyping, setIsTyping] = React.useState(false);
                                const [typingTimer, setTypingTimer] = React.useState(null);
                                const inputRef = React.useRef(null);
                                
                                // Update display value when field value changes (e.g., form reset)
                                React.useEffect(() => {
                                    if (!isTyping) {
                                        setDisplayValue(formatDurationForInput(field.value));
                                    }
                                }, [field.value, isTyping]);
                                
                                // Clean up timer on unmount
                                React.useEffect(() => {
                                    return () => {
                                        if (typingTimer) clearTimeout(typingTimer);
                                    };
                                }, [typingTimer]);
                                
                                // Smart hour-based auto-formatting function
                                const applyAutoFormatting = (input) => {
                                    // Single digit: "3" → "3:" (3 hours)
                                    if (/^\d$/.test(input)) {
                                        return input + ':';
                                    }
                                    // Two digits: "12" → "12:" (12 hours)
                                    if (/^\d{2}$/.test(input)) {
                                        return input + ':';
                                    }
                                    // Hour:minute pattern: "3:21" → "3:21:" (ready for seconds)
                                    if (/^\d{1,2}:\d{2}$/.test(input)) {
                                        return input + ':';
                                    }
                                    return input;
                                };
                                
                                // Enhanced validation for better UX feedback
                                const isValidFormat = React.useMemo(() => {
                                    if (!displayValue) return true; // Empty is valid
                                    if (!isNaN(Number(displayValue))) return Number(displayValue) >= 0; // Pure numbers must be non-negative
                                    if (displayValue.includes(':')) {
                                        // Validate time format patterns (allow incomplete during typing)
                                        const timePattern = /^\d{1,2}(:\d{0,2})?(:\d{0,2})?$/;
                                        if (!timePattern.test(displayValue)) return false;
                                        
                                        // Validate completed time values
                                        const parts = displayValue.split(':');
                                        if (parts.length >= 2 && parts[1].length === 2) {
                                            const seconds = parseInt(parts[1], 10);
                                            if (seconds >= 60) return false;
                                        }
                                        if (parts.length === 3 && parts[2].length === 2) {
                                            const minutes = parseInt(parts[1], 10);
                                            const seconds = parseInt(parts[2], 10);
                                            if (minutes >= 60 || seconds >= 60) return false;
                                        }
                                        return true;
                                    }
                                    // If it contains non-digits and no colons, it's invalid
                                    return /^\d+$/.test(displayValue);
                                }, [displayValue]);
                                
                                const handleInputChange = (e) => {
                                    const inputValue = e.target.value;
                                    setDisplayValue(inputValue);
                                    setIsTyping(true);
                                    
                                    // Clear existing timer
                                    if (typingTimer) clearTimeout(typingTimer);
                                    
                                    // Parse and update form field for validation (but don't format display)
                                    const parsedSeconds = parseDurationInput(inputValue);
                                    field.onChange(parsedSeconds);
                                    
                                    // Set timer for auto-formatting when user stops typing
                                    const timer = setTimeout(() => {
                                        setIsTyping(false);
                                        
                                        // Apply smart auto-formatting
                                        const autoFormatted = applyAutoFormatting(inputValue);
                                        if (autoFormatted !== inputValue) {
                                            setDisplayValue(autoFormatted);
                                            // Update cursor position after auto-formatting
                                            setTimeout(() => {
                                                if (inputRef.current) {
                                                    const newPosition = autoFormatted.length;
                                                    inputRef.current.setSelectionRange(newPosition, newPosition);
                                                }
                                            }, 0);
                                        }
                                    }, 800); // Shorter delay for auto-formatting
                                    setTypingTimer(timer);
                                };
                                
                                const handleBlur = (e) => {
                                    setIsTyping(false);
                                    if (typingTimer) {
                                        clearTimeout(typingTimer);
                                        setTypingTimer(null);
                                    }
                                    
                                    // Format the display value on blur for consistency
                                    const parsedSeconds = parseDurationInput(e.target.value);
                                    const formattedValue = formatDurationForInput(parsedSeconds);
                                    setDisplayValue(formattedValue);
                                    field.onBlur();
                                };
                                
                                const handleFocus = () => {
                                    // Allow natural editing - don't change the display value
                                    setIsTyping(true);
                                };
                                
                                // Dynamic helper text with hour-based format guidance
                                const getHelperText = () => {
                                    if (fieldState.error) return fieldState.error.message;
                                    if (isTyping && displayValue && !isValidFormat) {
                                        return 'Type h:m:s';
                                    }
                                    return 'Type h:m:s';
                                };
                                
                                return (
                                    <TextField
                                        inputRef={inputRef}
                                        label="Duration"
                                        fullWidth
                                        value={displayValue}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        onFocus={handleFocus}
                                        error={!!fieldState.error}
                                        helperText={getHelperText()}
                                        disabled={isSubmitting}
                                        placeholder="h:m:s"
                                        inputMode="text"
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <TimeIcon 
                                                            fontSize="small" 
                                                            color={
                                                                fieldState.error ? "error" :
                                                                isValidFormat ? "primary" : 
                                                                isTyping ? "action" : "action"
                                                            }
                                                        />
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                );
                            }}
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
                                    minRows={6}
                                    maxRows={12}
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
• Basic knowledge of...

⚠️ Important Notes:
• Make sure to...
• Don't forget to..."
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
                        startIcon={isSubmitting ? null : <SaveIcon />}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default LessonEditDialog;