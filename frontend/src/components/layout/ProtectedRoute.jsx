import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        let displayRole = decoded.role || '';
        if (displayRole === 'SUPER_ADMIN') displayRole = 'Admin';
        else if (displayRole === 'STAFF') displayRole = 'Staff';
        else if (displayRole === 'TEACHER') displayRole = 'Teacher';
        else if (displayRole === 'STUDENT') displayRole = 'Student';
        
        document.title = displayRole ? `Legacy Music Center | ${displayRole}` : 'Legacy Music Center';
      } catch (e) {
        document.title = 'Legacy Music Center';
      }
    } else {
      document.title = 'Legacy Music Center';
    }
    
    return () => {
      document.title = 'Legacy Music Center';
    };
  }, [token]);

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
