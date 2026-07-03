import { Routes, Route } from 'react-router-dom';
import { Home, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TeacherHome from './TeacherHome';
import ClassDetailPage from './ClassDetailPage';

export default function TeacherDashboard() {
  const sidebarLinks = [
    { label: 'Jadwal Mengajar', href: '/teacher', icon: Home },
    { label: 'Rekap Presensi', href: '/teacher/reports', icon: FileText },
  ];

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <Routes>
        <Route path="/" element={<TeacherHome />} />
        <Route path="/schedules/:id" element={<ClassDetailPage />} />
        <Route path="/reports" element={<div>Reports Page (Phase 8)</div>} />
      </Routes>
    </DashboardLayout>
  );
}
