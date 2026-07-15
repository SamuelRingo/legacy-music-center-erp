import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import RegisterPage from './pages/public/RegisterPage';
import LoginPage from './pages/public/LoginPage';
import EventsPage from './pages/public/EventsPage';
import AdminDashboard from './pages/admin/Dashboard';
import StaffDashboard from './pages/staff/Dashboard';
import LandingCmsPage from './pages/staff/LandingCmsPage';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import FinancePage from './pages/shared/FinancePage';
import InventoryPage from './pages/shared/InventoryPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DashboardProvider } from './context/DashboardContext';

import StaffAttendancePage from './pages/admin/StaffAttendancePage';
import StaffSalaryPage from './pages/admin/StaffSalaryPage';

export default function App() {
  return (
    <TooltipProvider>
    <DashboardProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events" element={<EventsPage />} />

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

        {/* Phase 7: Shared Finance & Inventory */}
        <Route path="/admin/finance" element={<ProtectedRoute roles={['SUPER_ADMIN']}><FinancePage /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute roles={['SUPER_ADMIN']}><InventoryPage /></ProtectedRoute>} />
        <Route path="/staff/finance" element={<ProtectedRoute roles={['STAFF', 'SUPER_ADMIN']}><FinancePage /></ProtectedRoute>} />
        <Route path="/staff/inventory" element={<ProtectedRoute roles={['STAFF', 'SUPER_ADMIN']}><InventoryPage /></ProtectedRoute>} />


        {/* Phase 8: Manajemen Staff */}
        <Route path="/admin/staff-attendance" element={<ProtectedRoute roles={['SUPER_ADMIN']}><StaffAttendancePage /></ProtectedRoute>} />
        <Route path="/admin/staff-salary" element={<ProtectedRoute roles={['SUPER_ADMIN']}><StaffSalaryPage /></ProtectedRoute>} />

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
    </TooltipProvider>
  );
}
