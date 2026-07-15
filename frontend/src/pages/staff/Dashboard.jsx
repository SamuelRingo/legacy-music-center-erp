import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StaffHome from './StaffHome';
import ApprovalPage from './ApprovalPage';
import SchedulingPage from './SchedulingPage';
import InvoicePage from './InvoicePage';
import ReportsPage from './ReportsPage';
import EventsPage from './EventsPage';
import LandingCmsPage from './LandingCmsPage';
import ProfilePage from '../../components/shared/ProfilePage';
import StudentDetailPage from '../shared/StudentDetailPage';
import ClassDetailPage from '../teacher/ClassDetailPage';

export default function StaffDashboard() {

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<StaffHome />} />
        <Route path="/approvals" element={<ApprovalPage />} />
        <Route path="/schedules" element={<SchedulingPage />} />
        <Route path="/invoices" element={<InvoicePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/landing-cms" element={<LandingCmsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/classes/:id" element={<ClassDetailPage readOnly={true} />} />
      </Routes>
    </DashboardLayout>
  );
}
