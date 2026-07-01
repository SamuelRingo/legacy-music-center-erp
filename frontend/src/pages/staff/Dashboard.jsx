import { Routes, Route } from 'react-router-dom';
import { Home, Users, Calendar, Receipt, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StaffHome from './StaffHome';
import ApprovalPage from './ApprovalPage';
import SchedulingPage from './SchedulingPage';
import InvoicePage from './InvoicePage';

export default function StaffDashboard() {
  const sidebarLinks = [
    { label: 'Dashboard', href: '/staff', icon: Home },
    { label: 'Persetujuan Siswa', href: '/staff/approvals', icon: Users },
    { label: 'Jadwal & Kelas', href: '/staff/schedules', icon: Calendar },
    { label: 'Tagihan & Pembayaran', href: '/staff/invoices', icon: Receipt },
    { label: 'Laporan Keuangan', href: '/staff/reports', icon: FileText },
  ];

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
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
