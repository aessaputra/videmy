import { Link } from 'react-router-dom';
import { HiAcademicCap } from 'react-icons/hi';

/**
 * Footer Component
 * 
 * Site footer with navigation links and branding.
 */
export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__content">
                    {/* Brand */}
                    <div className="footer__brand">
                        <div className="footer__logo">
                            <HiAcademicCap style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Videmy
                        </div>
                        <p className="footer__desc">
                            Platform kursus online berbasis video untuk meningkatkan skill Anda.
                            Belajar dari mana saja, kapan saja.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="footer__section-title">Platform</h4>
                        <nav className="footer__links">
                            <Link to="/courses" className="footer__link">All Courses</Link>
                            <Link to="/dashboard" className="footer__link">Dashboard</Link>
                        </nav>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="footer__section-title">Company</h4>
                        <nav className="footer__links">
                            <Link to="/" className="footer__link">About</Link>
                            <Link to="/" className="footer__link">Contact</Link>
                            <Link to="/" className="footer__link">Careers</Link>
                        </nav>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="footer__section-title">Legal</h4>
                        <nav className="footer__links">
                            <Link to="/" className="footer__link">Privacy Policy</Link>
                            <Link to="/" className="footer__link">Terms of Service</Link>
                        </nav>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>&copy; {currentYear} Videmy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
