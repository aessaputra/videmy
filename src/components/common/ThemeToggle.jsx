import { HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

/**
 * Theme Toggle Button
 * 
 * Toggles between dark and light mode with animated icon.
 */
export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <HiSun size={20} />
            ) : (
                <HiMoon size={20} />
            )}
        </button>
    );
}

export default ThemeToggle;
