import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TeacherHome from './TeacherHome';
import ClassDetailPage from './ClassDetailPage';
import MeetingDetailPage from './MeetingDetailPage';
import ProfilePage from '../../components/shared/ProfilePage';

export default function TeacherDashboard() {

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<TeacherHome />} />
        <Route path="/schedules/:id" element={<ClassDetailPage />} />
        <Route path="/meetings/:meetingId" element={<MeetingDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </DashboardLayout>
  );
}
