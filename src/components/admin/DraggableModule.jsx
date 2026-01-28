import { useState } from 'react';
import {
    Card,
    Box,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Divider,
    Chip,
    Stack,
    Tooltip
} from '@mui/material';
import {
    DragIndicator as DragIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    PlayArrow as LessonIcon,
    MoreVert as MoreIcon,
    ContentCopy as DuplicateIcon,
    KeyboardArrowUp as MoveUpIcon,
    KeyboardArrowDown as MoveDownIcon
} from '@mui/icons-material';
import { Draggable } from '@hello-pangea/dnd';
import { EditableModuleTitle } from './EditableModuleTitle';
import { EditableLessonTitle } from './EditableLessonTitle';
import { formatDuration } from '../../lib/format';

/**
 * DraggableModule Component
 * 
 * Enhanced module component with drag & drop, inline editing, and module actions.
 * Follows best practices for course management UX with @hello-pangea/dnd.
 * 
 * @param {Object} module - Module object
 * @param {number} index - Module index in the list
 * @param {Array} lessons - Lessons belonging to this module
 * @param {Function} onUpdateModule - Callback to update module
 * @param {Function} onDeleteModule - Callback to delete module
 * @param {Function} onDuplicateModule - Callback to duplicate module
 * @param {Function} onMoveModule - Callback to move module up/down
 * @param {Function} onAddLesson - Callback to add lesson to module
 * @param {Function} onUpdateLesson - Callback to update lesson
 * @param {Function} onDeleteLesson - Callback to delete lesson
 * @param {boolean} canMoveUp - Whether module can be moved up
 * @param {boolean} canMoveDown - Whether module can be moved down
 * @param {boolean} isDragging - Whether module is being dragged
 */
export function DraggableModule({
    module,
    index,
    lessons,
    onUpdateModule,
    onDeleteModule,
    onDuplicateModule,
    onMoveModule,
    onAddLesson,
    onUpdateLesson,
    onDeleteLesson,
    canMoveUp,
    canMoveDown,
    isDragging = false
}) {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const moduleLessons = lessons.filter(l => l.moduleId === module.$id);

    const handleMenuOpen = (event) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleDeleteModule = () => {
        handleMenuClose();
        onDeleteModule(module.$id);
    };

    const handleDuplicateModule = () => {
        handleMenuClose();
        onDuplicateModule(module);
    };

    const handleMoveUp = () => {
        handleMenuClose();
        onMoveModule(index, index - 1);
    };

    const handleMoveDown = () => {
        handleMenuClose();
        onMoveModule(index, index + 1);
    };

    return (
        <Draggable draggableId={module.$id} index={index}>
            {(provided, snapshot) => (
                <Card 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    variant="outlined" 
                    sx={{ 
                        overflow: 'visible',
                        opacity: snapshot.isDragging ? 0.8 : 1,
                        transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: snapshot.isDragging ? 4 : 1,
                        '&:hover': {
                            boxShadow: 2
                        }
                    }}
                >
                    {/* Module Header */}
                    <Box 
                        sx={{ 
                            p: 2, 
                            bgcolor: 'action.hover', 
                            borderBottom: 1, 
                            borderColor: 'divider',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            minWidth: 0 // Critical for flexbox text truncation
                        }}
                    >
                        {/* Drag Handle */}
                        <Tooltip title="Drag to reorder">
                            <IconButton
                                {...provided.dragHandleProps}
                                size="small"
                                sx={{ 
                                    cursor: 'grab',
                                    '&:active': { cursor: 'grabbing' },
                                    color: snapshot.isDragging ? 'primary.main' : 'text.disabled'
                                }}
                            >
                                <DragIcon />
                            </IconButton>
                        </Tooltip>

                        {/* Module Number */}
                        <Chip 
                            label={`${index + 1}`} 
                            size="small" 
                            variant="outlined"
                            sx={{ minWidth: 32 }}
                        />

                        {/* Editable Title */}
                        <EditableModuleTitle
                            module={module}
                            onSave={onUpdateModule}
                        />

                        {/* Lesson Count */}
                        <Chip 
                            label={`${moduleLessons.length} lessons`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />

                        {/* Actions */}
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Add lesson">
                                <IconButton 
                                    size="small" 
                                    onClick={() => onAddLesson(module.$id)}
                                    color="primary"
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                            
                            <IconButton 
                                size="small" 
                                onClick={handleMenuOpen}
                                color="default"
                            >
                                <MoreIcon />
                            </IconButton>
                        </Stack>

                        {/* Module Actions Menu */}
                        <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleDuplicateModule}>
                                <DuplicateIcon sx={{ mr: 1 }} fontSize="small" />
                                Duplicate Module
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleMoveUp} disabled={!canMoveUp}>
                                <MoveUpIcon sx={{ mr: 1 }} fontSize="small" />
                                Move Up
                            </MenuItem>
                            <MenuItem onClick={handleMoveDown} disabled={!canMoveDown}>
                                <MoveDownIcon sx={{ mr: 1 }} fontSize="small" />
                                Move Down
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleDeleteModule} sx={{ color: 'error.main' }}>
                                <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                                Delete Module
                            </MenuItem>
                        </Menu>
                    </Box>

                    {/* Lessons List */}
                    <Box>
                        <List disablePadding>
                            {moduleLessons.map((lesson) => (
                                <ListItem 
                                    key={lesson.$id} 
                                    divider 
                                    sx={{ pl: 4 }}
                                    secondaryAction={
                                        <Stack direction="row" spacing={0.5} sx={{ mr: 1 }}>
                                            <EditableLessonTitle.EditButton
                                                lesson={lesson}
                                                onSave={onUpdateLesson}
                                            />
                                            <Tooltip title="Delete lesson">
                                                <IconButton 
                                                    size="small" 
                                                    color="error" 
                                                    onClick={() => onDeleteLesson(lesson.$id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    }
                                >
                                    <LessonIcon sx={{ mr: 2, color: 'primary.main', fontSize: 20 }} />
                                    
                                    {/* Editable Lesson Title */}
                                    <EditableLessonTitle
                                        lesson={lesson}
                                        onSave={onUpdateLesson}
                                    />
                                </ListItem>
                            ))}
                            
                            {/* Empty State */}
                            {moduleLessons.length === 0 && (
                                <Box sx={{ p: 2, pl: 4, textAlign: 'center' }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => onAddLesson(module.$id)}
                                        sx={{ 
                                            color: 'text.secondary',
                                            border: '2px dashed',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            p: 2,
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                color: 'primary.main'
                                            }
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                    <Box sx={{ mt: 1, color: 'text.secondary', fontSize: 12 }}>
                                        Add first lesson
                                    </Box>
                                </Box>
                            )}
                        </List>
                    </Box>
                </Card>
            )}
        </Draggable>
    );
}

export default DraggableModule;