import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StaffHome from './StaffHome';
import ApprovalPage from './ApprovalPage';
import SchedulingPage from './SchedulingPage';
import InvoicePage from './InvoicePage';
import ReportsPage from './ReportsPage';
import EventsPage from './EventsPage';

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
      </Routes>
    </DashboardLayout>
  );
}
