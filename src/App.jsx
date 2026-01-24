import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider, ROLES } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import { Layout } from './components/layout';

// Common
import { ProtectedRoute, GuestRoute, Loading } from './components/common';

// Public Pages
import { Home, Login, Register, Courses, CourseDetail } from './pages/public';

// Student Pages
import { Dashboard, Learn } from './pages/student';

// Admin Pages
import { ManageCourses, ManageUsers } from './pages/admin';

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
              {/* Public Routes with Layout */}
              <Route element={<Layout />}>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />

                {/* Guest Only (Login/Register) */}
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

                {/* Protected - Student+ */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected - Instructor+ */}
                <Route
                  path="/admin/courses"
                  element={
                    <ProtectedRoute roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
                      <ManageCourses />
                    </ProtectedRoute>
                  }
                />

                {/* Protected - Admin Only */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={[ROLES.ADMIN]}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Learn Page - Full Width (No Footer) */}
              <Route
                path="/learn/:courseId/:lessonId"
                element={
                  <ProtectedRoute>
                    <Learn />
                  </ProtectedRoute>
                }
              />

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
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-error)',
                  secondary: 'white',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
