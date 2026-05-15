import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageSpinner } from '../components/ui/Spinner';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
