import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Link as MuiLink,
    Divider,
    Stack,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

/**
 * Footer Component
 * 
 * MUI-based responsive footer with navigation links and branding.
 */
export function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        platform: [
            { label: 'All Courses', to: '/courses' },
            { label: 'Dashboard', to: '/dashboard' },
        ],
        company: [
            { label: 'About', to: '/' },
            { label: 'Contact', to: '/' },
            { label: 'Careers', to: '/' },
        ],
        legal: [
            { label: 'Privacy Policy', to: '/' },
            { label: 'Terms of Service', to: '/' },
        ],
    };

    const LinkSection = ({ title, links }) => (
        <Box>
            <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                color="text.primary"
            >
                {title}
            </Typography>
            <Stack spacing={1}>
                {links.map((link) => (
                    <MuiLink
                        key={link.label}
                        component={Link}
                        to={link.to}
                        underline="hover"
                        color="text.secondary"
                        sx={{
                            transition: 'color 0.2s',
                            '&:hover': { color: 'primary.main' },
                        }}
                    >
                        {link.label}
                    </MuiLink>
                ))}
            </Stack>
        </Box>
    );

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                py: 6,
                mt: 'auto',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Brand */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
                            <Typography variant="h6" color="primary" fontWeight={700}>
                                Videmy
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
                            Platform kursus online berbasis video untuk meningkatkan skill Anda.
                            Belajar dari mana saja, kapan saja.
                        </Typography>
                    </Grid>

                    {/* Platform Links */}
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                        <LinkSection title="Platform" links={footerLinks.platform} />
                    </Grid>

                    {/* Company Links */}
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                        <LinkSection title="Company" links={footerLinks.company} />
                    </Grid>

                    {/* Legal Links */}
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                        <LinkSection title="Legal" links={footerLinks.legal} />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="body2" color="text.secondary" textAlign="center">
                    © {currentYear} Videmy. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
}

export default Footer;
