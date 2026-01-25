import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Tabs,
    Tab,
    Stack,
    CircularProgress,
    Card,
    CardMedia,
} from '@mui/material';
import { CloudUpload as UploadIcon, YouTube as YouTubeIcon, Image as ImageIcon } from '@mui/icons-material';
import { storage, ID, STORAGE_BUCKET_ID, Permission, Role } from '../../lib/appwrite';
import toast from 'react-hot-toast';

export function ThumbnailUploader({ initialValue, onChange, user }) {
    const [tab, setTab] = useState(0); // 0: Upload, 1: YouTube
    const [preview, setPreview] = useState(initialValue || '');
    const [uploading, setUploading] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');

    useEffect(() => {
        if (initialValue) {
            setPreview(initialValue);
            // Auto detect if it's a youtube image to switch tab? 
            // Nay, user might want to replace it.
            if (initialValue.includes('img.youtube.com')) {
                setTab(1);
            }
        }
    }, [initialValue]);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    // --- YouTube Logic ---
    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleYoutubeChange = (e) => {
        const url = e.target.value;
        setYoutubeUrl(url);

        const videoId = getYoutubeId(url);
        if (videoId) {
            const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            setPreview(thumbUrl);
            onChange(thumbUrl);
        } else {
            // If user clears input or invalid, don't necessarily clear preview if it was already set?
            // Better to clear if it doesn't match
        }
    };

    // --- Upload Logic ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Use JPG, PNG, or WebP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('File too large. Max 5MB.');
            return;
        }

        setUploading(true);
        try {
            // Upload with Permissions
            const response = await storage.createFile(
                STORAGE_BUCKET_ID,
                ID.unique(),
                file,
                [
                    Permission.read(Role.any()),                // Public Read
                    Permission.update(Role.user(user.$id)),     // Owner Update
                    Permission.delete(Role.user(user.$id))      // Owner Delete
                ]
            );

            // Get View URL
            const fileUrl = storage.getFileView(
                STORAGE_BUCKET_ID,
                response.$id
            );

            setPreview(fileUrl);
            onChange(fileUrl);
            toast.success('Thumbnail uploaded!');
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
                <Tabs value={tab} onChange={handleTabChange} aria-label="thumbnail source tabs">
                    <Tab icon={<UploadIcon fontSize="small" />} iconPosition="start" label="Upload Image" />
                    <Tab icon={<YouTubeIcon fontSize="small" />} iconPosition="start" label="From YouTube" />
                </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">

                    {/* Controls */}
                    <Box sx={{ flex: 1, width: '100%' }}>
                        {tab === 0 ? (
                            <Stack spacing={2}>
                                <Typography variant="body2" color="text.secondary">
                                    Upload a custom cover image (JPG, PNG, WebP). Max 5MB.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                                    disabled={uploading}
                                    fullWidth
                                    sx={{ height: 56, borderStyle: 'dashed' }}
                                >
                                    {uploading ? 'Uploading...' : 'Choose File'}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                </Button>
                            </Stack>
                        ) : (
                            <Stack spacing={2}>
                                <Typography variant="body2" color="text.secondary">
                                    Paste a YouTube video URL to automatically use its thumbnail.
                                </Typography>
                                <TextField
                                    label="YouTube Video URL"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={youtubeUrl}
                                    onChange={handleYoutubeChange}
                                    fullWidth
                                />
                            </Stack>
                        )}
                    </Box>

                    {/* Preview */}
                    <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
                        <Typography variant="overline" display="block" gutterBottom>
                            Preview
                        </Typography>
                        <Card sx={{ bgcolor: 'action.hover', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {preview ? (
                                <CardMedia
                                    component="img"
                                    image={preview}
                                    alt="Thumbnail Preview"
                                    sx={{ height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                    <ImageIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                                    <Typography variant="caption" display="block">
                                        No Image Selected
                                    </Typography>
                                </Box>
                            )}
                        </Card>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
