import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import RegisterPage from './pages/public/RegisterPage';
import LoginPage from './pages/public/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import StaffDashboard from './pages/staff/Dashboard';
import LandingCmsPage from './pages/staff/LandingCmsPage';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import { DashboardProvider } from './context/DashboardContext';

export default function App() {
  return (
    <DashboardProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — Admin */}
        <Route path="/admin/*" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Protected — Staff */}
        <Route path="/staff/*" element={
          <ProtectedRoute roles={['STAFF', 'SUPER_ADMIN']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        {/* Protected — Teacher */}
        <Route path="/teacher/*" element={
          <ProtectedRoute roles={['TEACHER']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />

        {/* Protected — Student */}
        <Route path="/student/*" element={
          <ProtectedRoute roles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </BrowserRouter>
    </DashboardProvider>
  );
}
