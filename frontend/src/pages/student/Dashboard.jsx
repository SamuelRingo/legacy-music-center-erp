import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StudentHome from './StudentHome';
import InvoicePage from './InvoicePage';
import StudentProgressPage from './StudentProgressPage';

export default function StudentDashboard() {

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/invoices" element={<InvoicePage />} />
        <Route path="/progress" element={<StudentProgressPage />} />
      </Routes>
    </DashboardLayout>
  );
}
