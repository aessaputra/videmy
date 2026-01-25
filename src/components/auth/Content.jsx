import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { School as SchoolIcon } from '@mui/icons-material';

/**
 * Login Side Content
 * Displays a high-quality coding aesthetic image.
 * 
 * Updated: Full width/height, no border radius, for split layout.
 */
export default function Content() {
    return (
        <Box
            sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundImage: 'url(https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2075&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                // Removed border radius and specific sizing to fill the Grid item
                height: '100%',
                width: '100%',
                p: 4,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', // Slightly darker for better text contrast
                    zIndex: 0,
                },
            }}
        >
            {/* Overlay Content */}
            <Box sx={{ position: 'relative', zIndex: 1, color: 'white', mt: 'auto', mb: 4 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.2 }}>
                    Master the Art <br /> of Coding
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 'normal' }}>
                    Join thousands of developers building the future.
                </Typography>
            </Box>
        </Box>
    );
}
