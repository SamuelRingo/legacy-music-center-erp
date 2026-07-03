import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StaffHome from './StaffHome';
import ApprovalPage from './ApprovalPage';
import SchedulingPage from './SchedulingPage';
import InvoicePage from './InvoicePage';

export default function StaffDashboard() {

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<StaffHome />} />
        <Route path="/approvals" element={<ApprovalPage />} />
        <Route path="/schedules" element={<SchedulingPage />} />
        <Route path="/invoices" element={<InvoicePage />} />
        <Route path="/reports" element={<div>Report Page (Phase 8)</div>} />
      </Routes>
    </DashboardLayout>
  );
}
