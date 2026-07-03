import { Routes, Route } from 'react-router-dom';
import { Home, Receipt, CheckSquare } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StudentHome from './StudentHome';
import InvoicePage from './InvoicePage';
import StudentProgressPage from './StudentProgressPage';

export default function StudentDashboard() {
  const sidebarLinks = [
    { label: 'Dashboard', href: '/student', icon: Home },
    { label: 'Tagihan Saya', href: '/student/invoices', icon: Receipt },
    { label: 'Progress Belajar', href: '/student/progress', icon: CheckSquare },
  ];

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/invoices" element={<InvoicePage />} />
        <Route path="/progress" element={<StudentProgressPage />} />
      </Routes>
    </DashboardLayout>
  );
}
