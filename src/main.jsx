import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Fontsource fonts (self-hosted for better performance)
import '@fontsource-variable/inter';  // Variable font - all weights
import '@fontsource/poppins/500.css'; // Medium for headings
import '@fontsource/poppins/600.css'; // Semibold for headings
import '@fontsource/poppins/700.css'; // Bold for headings

import './index.css';

/**
 * Application Entry Point
 * 
 * Renders the App component into the DOM.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
