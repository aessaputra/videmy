/**
 * Format seconds to duration string (MM:SS or H:MM:SS)
 * @param {number} seconds 
 * @returns {string} Duration string
 */
export const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * Parse duration string to seconds
 * @param {string} input - Duration in various formats
 * @returns {number} Duration in seconds
 */
export const parseDurationToSeconds = (input) => {
    if (!input || input.trim() === '') return 0;
    
    const trimmed = input.trim();
    
    // Pure number (treat as seconds)
    if (/^\d+$/.test(trimmed)) {
        return parseInt(trimmed, 10);
    }
    
    // Check if it contains colons
    if (trimmed.includes(':')) {
        const parts = trimmed.split(':').map(Number);
        
        // Validate all parts are valid numbers
        if (parts.some(part => isNaN(part) || part < 0)) {
            return 0;
        }
        
        if (parts.length === 2) {
            // MM:SS format
            const [minutes, seconds] = parts;
            if (seconds >= 60) return 0;
            return (minutes * 60) + seconds;
        }
        
        if (parts.length === 3) {
            // HH:MM:SS format
            const [hours, minutes, seconds] = parts;
            if (minutes >= 60 || seconds >= 60) return 0;
            return (hours * 3600) + (minutes * 60) + seconds;
        }
    }
    
    return 0;
};
