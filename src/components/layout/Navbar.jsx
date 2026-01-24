import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiUser, HiLogout, HiAcademicCap } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { Button, ThemeToggle } from '../common';

/**
 * Navbar Component
 * 
 * Responsive navigation bar with mobile menu.
 * Shows different links based on auth state and role.
 */
export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout, hasRole, ROLES } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Navigation links based on role
    const navLinks = [
        { to: '/', label: 'Home', public: true },
        { to: '/courses', label: 'Courses', public: true },
    ];

    const authNavLinks = [
        { to: '/dashboard', label: 'Dashboard', roles: [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN] },
        { to: '/admin/courses', label: 'Manage Courses', roles: [ROLES.INSTRUCTOR, ROLES.ADMIN] },
        { to: '/admin/users', label: 'Users', roles: [ROLES.ADMIN] },
    ];

    return (
        <>
            <nav className="navbar">
                <div className="container navbar__container">
                    {/* Logo */}
                    <Link to="/" className="navbar__logo">
                        <HiAcademicCap style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Videmy
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar__nav">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}

                        {isAuthenticated &&
                            authNavLinks
                                .filter((link) => hasRole(link.roles))
                                .map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        className={({ isActive }) =>
                                            `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                    </div>

                    {/* Actions */}
                    <div className="navbar__actions">
                        {/* Theme Toggle */}
                        <ThemeToggle />
                        {isAuthenticated ? (
                            <>
                                <div className="avatar hidden-mobile" title={user?.name}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <HiLogout />
                                    <span className="hidden-mobile">Logout</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link to="/register" className="hidden-mobile">
                                    <Button variant="primary" size="sm">Get Started</Button>
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="navbar__mobile-toggle"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu--open' : ''}`}>
                <button
                    className="mobile-menu__close"
                    onClick={closeMobileMenu}
                    aria-label="Close menu"
                >
                    <HiX size={24} />
                </button>

                <nav className="mobile-menu__nav">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className="mobile-menu__link"
                            onClick={closeMobileMenu}
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    {isAuthenticated &&
                        authNavLinks
                            .filter((link) => hasRole(link.roles))
                            .map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className="mobile-menu__link"
                                    onClick={closeMobileMenu}
                                >
                                    {link.label}
                                </NavLink>
                            ))}

                    {!isAuthenticated && (
                        <>
                            <NavLink to="/login" className="mobile-menu__link" onClick={closeMobileMenu}>
                                Login
                            </NavLink>
                            <NavLink to="/register" className="mobile-menu__link" onClick={closeMobileMenu}>
                                Register
                            </NavLink>
                        </>
                    )}

                    {isAuthenticated && (
                        <button
                            className="mobile-menu__link"
                            onClick={() => {
                                handleLogout();
                                closeMobileMenu();
                            }}
                            style={{ textAlign: 'left' }}
                        >
                            Logout
                        </button>
                    )}
                </nav>
            </div>
        </>
    );
}

export default Navbar;
