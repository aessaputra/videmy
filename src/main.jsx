import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App.jsx';
import theme from './theme.js';

// Fontsource fonts (self-hosted for better performance)
import '@fontsource-variable/inter';  // Variable font - all weights
import '@fontsource/poppins/500.css'; // Medium for headings
import '@fontsource/poppins/600.css'; // Semibold for headings
import '@fontsource/poppins/700.css'; // Bold for headings

import './index.css';

/**
 * Application Entry Point
 * 
 * Wraps the app with MUI ThemeProvider for consistent styling
 * and CssBaseline for CSS normalization.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
