import { useState, useRef, useEffect } from 'react';
import {
    Typography,
    TextField,
    IconButton,
    Box,
    Stack,
    CircularProgress
} from '@mui/material';
import {
    Edit as EditIcon,
    Check as SaveIcon,
    Close as CancelIcon
} from '@mui/icons-material';
import { toast } from 'sonner';

/**
 * EditableModuleTitle Component
 * 
 * Provides inline editing functionality for module titles with best practices:
 * - Double-click to edit
 * - Save on Enter or blur
 * - Cancel on Escape
 * - Loading states
 * - Error handling
 * 
 * @param {Object} module - Module object with $id and title
 * @param {Function} onSave - Callback when title is saved
 * @param {boolean} disabled - Whether editing is disabled
 */
export function EditableModuleTitle({ module, onSave, disabled = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(module.title);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const startEditing = () => {
        if (disabled) return;
        setTitle(module.title);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setTitle(module.title);
        setIsEditing(false);
    };

    const saveTitle = async () => {
        const trimmedTitle = title.trim();
        
        if (!trimmedTitle) {
            toast.error('Module title cannot be empty');
            return;
        }

        if (trimmedTitle === module.title) {
            setIsEditing(false);
            return;
        }

        setSaving(true);
        try {
            await onSave(module.$id, trimmedTitle);
            setIsEditing(false);
            toast.success('Module title updated');
        } catch (error) {
            console.error('Save module title failed:', error);
            toast.error('Failed to update module title');
            setTitle(module.title); // Reset to original
        } finally {
            setSaving(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTitle();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEditing();
        }
    };

    const handleBlur = () => {
        if (!saving) {
            saveTitle();
        }
    };

    if (isEditing) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <TextField
                    inputRef={inputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    size="small"
                    variant="outlined"
                    fullWidth
                    disabled={saving}
                    sx={{
                        '& .MuiInputBase-root': {
                            fontSize: '1rem',
                            fontWeight: 600
                        }
                    }}
                />
                <Stack direction="row" spacing={0.5}>
                    <IconButton
                        size="small"
                        onClick={saveTitle}
                        disabled={saving || !title.trim()}
                        color="primary"
                        title="Save (Enter)"
                    >
                        {saving ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={cancelEditing}
                        disabled={saving}
                        color="secondary"
                        title="Cancel (Escape)"
                    >
                        <CancelIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>
        );
    }

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                flex: 1,
                minWidth: 0, // Critical for flexbox text truncation
                cursor: disabled ? 'default' : 'pointer',
                '&:hover .edit-icon': {
                    opacity: disabled ? 0 : 1
                }
            }}
            onDoubleClick={startEditing}
        >
            <Typography 
                fontWeight={600} 
                noWrap
                sx={{ 
                    flex: 1,
                    userSelect: 'none',
                    color: disabled ? 'text.disabled' : 'inherit',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-all',
                    maxWidth: '100%'
                }}
                title={module.title} // Show full title on hover
            >
                {module.title}
            </Typography>
            {!disabled && (
                <IconButton
                    className="edit-icon"
                    size="small"
                    onClick={startEditing}
                    sx={{ 
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        ml: 1
                    }}
                    title="Edit title (double-click)"
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
}

export default EditableModuleTitle;