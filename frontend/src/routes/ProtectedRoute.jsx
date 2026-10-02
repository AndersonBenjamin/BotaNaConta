import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from '../components/Loading.jsx';

export default function ProtectedRoute() {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return <Loading fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
