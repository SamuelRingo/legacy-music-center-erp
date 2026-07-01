import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userRole = decoded.role; // pastikan role ada di JWT payload

    if (roles && !roles.includes(userRole)) {
      return <Navigate to="/" />;
    }

    return children;
  } catch {
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
}
