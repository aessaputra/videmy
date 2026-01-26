import { useAuth } from '../../context/AuthContext';
import { StudentDashboard } from './StudentDashboard';
import { InstructorDashboard } from '../dashboard/InstructorDashboard';
import { AdminDashboard } from '../dashboard/AdminDashboard';

/**
 * Dashboard Router
 * 
 * Switches between role-specific dashboard views.
 */
export function Dashboard() {
    const { user, ROLES } = useAuth();

    // Safety check
    if (!user) return null;

    if (user.role === 'admin') {
        return <AdminDashboard />;
    }

    // Instructors can create courses, but might also be students
    // For now, prioritize Instructor View if they have the role
    if (user.roles?.includes(ROLES.INSTRUCTOR) || user.role === 'instructor') {
        return <InstructorDashboard />;
    }

    return <StudentDashboard />;
}

export default Dashboard;
