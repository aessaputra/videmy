import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Layout Component
 * 
 * Main layout wrapper with Navbar and Footer.
 * Uses React Router's Outlet for nested routes.
 */
export function Layout() {
    return (
        <div className="layout">
            <Navbar />
            <main className="layout__main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default Layout;
