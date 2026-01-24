import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Layout Component
 * 
 * MUI-based main layout wrapper with Navbar and Footer.
 * Uses flexbox for sticky footer behavior.
 */
export function Layout() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
}

export default Layout;
