/**
 * Videmy MUI Theme Configuration
 * 
 * Custom theme with Teal/Gold color scheme, Inter/Poppins typography,
 * and dark/light mode support using MUI's colorSchemes.
 */
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create base theme with color schemes for dark/light mode
let theme = createTheme({
    // Enable both light and dark color schemes
    colorSchemes: {
        light: true,
        dark: true,
    },
    cssVariables: {
        colorSchemeSelector: 'class',
    },

    // Color palette
    palette: {
        primary: {
            main: '#14b8a6',      // Teal
            light: '#2dd4bf',
            dark: '#0d9488',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f59e0b',      // Gold/Amber
            light: '#fbbf24',
            dark: '#d97706',
            contrastText: '#000000',
        },
        info: {
            main: '#22d3ee',      // Light Teal/Cyan (accent)
            light: '#67e8f9',
            dark: '#0891b2',
        },
        success: {
            main: '#22c55e',
            light: '#4ade80',
            dark: '#16a34a',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
    },

    // Typography with Inter (body) and Poppins (headings)
    typography: {
        fontFamily: '"Inter Variable", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontFamily: '"Poppins", "Inter Variable", sans-serif',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h2: {
            fontFamily: '"Poppins", "Inter Variable", sans-serif',
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h3: {
            fontFamily: '"Poppins", "Inter Variable", sans-serif',
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h4: {
            fontFamily: '"Poppins", "Inter Variable", sans-serif',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontFamily: '"Poppins", "Inter Variable", sans-serif',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h6: {
            fontFamily: '"Poppins", "Inter Variable", sans-serif',
            fontWeight: 600,
            lineHeight: 1.5,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },

    // Shape
    shape: {
        borderRadius: 12,
    },

    // Component overrides
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollBehavior: 'smooth',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: '#0d9488',
                    },
                },
                sizeLarge: {
                    padding: '14px 32px',
                    fontSize: '1.1rem',
                },
            },
            defaultProps: {
                disableElevation: true,
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: 24,
                    '&:last-child': {
                        paddingBottom: 24,
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                },
            },
            defaultProps: {
                color: 'inherit',
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 8,
                },
            },
        },
        MuiContainer: {
            defaultProps: {
                maxWidth: 'lg',
            },
        },
    },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

export default theme;
