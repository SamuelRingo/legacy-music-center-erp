import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminHome from './AdminHome';
import UsersPage from './UsersPage';
import CoursesPage from './CoursesPage';
import ClassroomsPage from './ClassroomsPage';

export default function AdminDashboard() {

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/classrooms" element={<ClassroomsPage />} />
      </Routes>
    </DashboardLayout>
  );
}
