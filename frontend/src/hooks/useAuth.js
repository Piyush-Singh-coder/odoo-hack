import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';

export const useAuth = (requiredRole = null) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (requiredRole && user.role !== requiredRole && !['admin'].includes(user.role)) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, user, requiredRole, navigate]);

  return { isAuthenticated, user };
};
