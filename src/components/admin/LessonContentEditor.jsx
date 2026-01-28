import { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Stack,
    Tabs,
    Tab,
    Divider,
    Alert,
    Chip
} from '@mui/material';
import {
    Save as SaveIcon,
    Preview as PreviewIcon,
    Edit as EditIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { toast } from 'sonner';
import { databases, DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';
import { LessonContent } from '../student/LessonContent';

/**
 * LessonContentEditor Component
 * 
 * Advanced editor for lesson content with preview functionality.
 * Can be used as standalone component or integrated into lesson management.
 * 
 * @param {Object} lesson - Lesson object to edit
 * @param {Function} onSave - Callback when content is saved
 * @param {boolean} autoSave - Enable auto-save functionality
 */
export function LessonContentEditor({ lesson, onSave, autoSave = false }) {
    const [content, setContent] = useState(lesson?.content || '');
    const [activeTab, setActiveTab] = useState(0);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const handleSave = async () => {
        if (!lesson?.$id) {
            toast.error('No lesson selected');
            return;
        }

        setSaving(true);
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.LESSONS,
                lesson.$id,
                { content: content.trim() }
            );
            
            setLastSaved(new Date());
            toast.success('Content saved successfully');
            
            if (onSave) {
                onSave({ ...lesson, content: content.trim() });
            }
        } catch (error) {
            console.error('Save content failed:', error);
            toast.error('Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    const contentTemplate = `📚 Learning Objectives:
• Understand the core concepts of...
• Learn how to implement...
• Master the best practices for...

🎯 What You'll Build:
In this lesson, you'll create...

🔗 Resources & Links:
• Documentation: [Add link here]
• Code Repository: [Add GitHub link]
• Additional Reading: [Add resource links]

💡 Prerequisites:
• Basic knowledge of...
• Familiarity with...

⚠️ Important Notes:
• Make sure to...
• Don't forget to...

🏆 Challenge:
Try to implement... (optional exercise)`;

    const insertTemplate = () => {
        setContent(contentTemplate);
    };

    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = content.length;

    return (
        <Card variant="outlined">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between" 
                    sx={{ p: 2 }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Lesson Content Editor
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {lastSaved && (
                            <Typography variant="caption" color="text.secondary">
                                Last saved: {lastSaved.toLocaleTimeString()}
                            </Typography>
                        )}
                        <Chip 
                            label={`${wordCount} words`} 
                            size="small" 
                            variant="outlined" 
                        />
                    </Stack>
                </Stack>
                
                <Tabs 
                    value={activeTab} 
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                >
                    <Tab icon={<EditIcon />} iconPosition="start" label="Edit" />
                    <Tab icon={<PreviewIcon />} iconPosition="start" label="Preview" />
                </Tabs>
            </Box>

            <CardContent sx={{ p: 0 }}>
                {/* EDIT TAB */}
                {activeTab === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Alert severity="info" icon={<InfoIcon />}>
                                <Typography variant="body2">
                                    <strong>Content Tips:</strong> Use emojis, bullet points, and clear sections. 
                                    Add learning objectives, resources, and prerequisites to help students.
                                </Typography>
                            </Alert>

                            <Stack direction="row" spacing={2}>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={insertTemplate}
                                    disabled={content.length > 0}
                                >
                                    Insert Template
                                </Button>
                                <Button 
                                    variant="contained" 
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={saving || !content.trim()}
                                    size="small"
                                >
                                    {saving ? 'Saving...' : 'Save Content'}
                                </Button>
                            </Stack>

                            <TextField
                                multiline
                                minRows={12}
                                maxRows={20}
                                fullWidth
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter lesson content, learning objectives, resources, and additional information for students..."
                                variant="outlined"
                                sx={{
                                    '& .MuiInputBase-root': {
                                        fontFamily: 'monospace',
                                        fontSize: '14px',
                                        lineHeight: 1.6
                                    }
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                    {charCount} characters • {wordCount} words
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={saving || !content.trim()}
                                >
                                    {saving ? 'Saving...' : 'Save Content'}
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                )}

                {/* PREVIEW TAB */}
                {activeTab === 1 && (
                    <Box sx={{ p: 3 }}>
                        {content.trim() ? (
                            <LessonContent 
                                lesson={{ ...lesson, content }} 
                                hasAccess={true}
                                defaultExpanded={true}
                            />
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No Content to Preview
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Switch to Edit tab to add lesson content.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default LessonContentEditor;