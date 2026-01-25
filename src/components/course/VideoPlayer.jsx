/**
 * Video Player Component
 * 
 * Embeds YouTube videos responsively.
 * Extracts video ID from various YouTube URL formats.
 * 
 * @param {Object} props
 * @param {string} props.youtubeUrl - YouTube video URL
 * @param {string} props.title - Video title for accessibility
 */

import { Box } from '@mui/material';

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtu.be/, youtube.com/watch?v=, youtube.com/embed/
 * 
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null
 */
function extractYouTubeId(url) {
    if (!url) return null;

    const patterns = [
        /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

export function VideoPlayer({ youtubeUrl, title = 'Video' }) {
    const videoId = extractYouTubeId(youtubeUrl);

    if (!videoId) {
        return (
            <div className="video-player" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)'
            }}>
                <p>Invalid or missing video URL</p>
            </div>
        );
    }

    return (
        <Box
            className="video-player"
            sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 Aspect Ratio
                backgroundColor: 'black',
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: 3
            }}
        >
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                }}
            />
        </Box>
    );
}

export default VideoPlayer;
