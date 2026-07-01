import { Routes, Route } from 'react-router-dom';
import { Home, Receipt, FileText, CheckSquare } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StudentHome from './StudentHome';
import InvoicePage from './InvoicePage';

export default function StudentDashboard() {
  const sidebarLinks = [
    { label: 'Dashboard', href: '/student', icon: Home },
    { label: 'Tagihan Saya', href: '/student/invoices', icon: Receipt },
    { label: 'Progress Belajar', href: '/student/progress', icon: CheckSquare },
    { label: 'Rapor Nilai', href: '/student/reports', icon: FileText },
  ];

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/invoices" element={<InvoicePage />} />
        <Route path="/progress" element={<div>Progress Page (Phase 6)</div>} />
        <Route path="/reports" element={<div>Report Page (Phase 6)</div>} />
      </Routes>
    </DashboardLayout>
  );
}
