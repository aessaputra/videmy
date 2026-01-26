import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Context
import { AuthProvider, ROLES } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import { Layout } from './components/layout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Common
import { ProtectedRoute, GuestRoute, Loading } from './components/common';

// Public Pages
import { Home, Login, Register, Courses, CourseDetail } from './pages/public';

// Student Pages
import { Dashboard, Learn } from './pages/student';
import { Profile } from './pages/dashboard/Profile';
import { Settings } from './pages/dashboard/Settings';


// Admin Pages
import { ManageCourses, ManageUsers, CreateCourse, EditCourse } from './pages/admin';

// Debug
import { ConnectionStatus } from './components/debug';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * App Component
 * 
 * Root component with providers and routing configuration.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth - Standalone Layout */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />

              {/* Public Routes with Main Layout (Navbar + Footer) */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
              </Route>

              {/* Dashboard Routes with DashboardLayout (Sidebar) */}
              <Route element={<DashboardLayout />}>
                {/* Student Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />

                {/* Instructor+ Routes */}
                <Route
                  path="/admin/courses"
                  element={
                    <ProtectedRoute roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
                      <ManageCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses/new"
                  element={
                    <ProtectedRoute roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
                      <CreateCourse />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses/:id/edit"
                  element={
                    <ProtectedRoute roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
                      <EditCourse />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Routes */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={[ROLES.ADMIN]}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />


                {/* Common Authenticated Routes */}
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Learn Page - Full Width (No Sidebar) */}
              <Route
                path="/learn/:courseId/:lessonId"
                element={
                  <ProtectedRoute>
                    <Learn />
                  </ProtectedRoute>
                }
              />

              {/* Debug Route - Temporary */}
              <Route path="/debug" element={<ConnectionStatus />} />

              {/* 404 Not Found */}
              <Route
                path="*"
                element={
                  <Layout>
                    <div className="empty-state" style={{ minHeight: '60vh' }}>
                      <div className="empty-state__icon">🔍</div>
                      <h3 className="empty-state__title">Page Not Found</h3>
                      <p className="empty-state__desc">
                        The page you're looking for doesn't exist.
                      </p>
                    </div>
                  </Layout>
                }
              />
            </Routes>
          </BrowserRouter>

          {/* Toast Notifications */}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={4000}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
