import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectAuthReady, selectIsStaff, selectUser } from '@/features/auth/authSlice';
import PageLoader from '@/components/ui/PageLoader';
import Forbidden from '@/pages/public/Forbidden';

/**
 * Frontend guards only decide what to *show*. Every admin/account API call is
 * authorised again by Laravel (auth:sanctum + role middleware), so typing a URL
 * never exposes data.
 */
export function RequireAuth() {
  const ready = useSelector(selectAuthReady);
  const user = useSelector(selectUser);
  const location = useLocation();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return <Outlet />;
}

export function RequireStaff() {
  const ready = useSelector(selectAuthReady);
  const user = useSelector(selectUser);
  const isStaff = useSelector(selectIsStaff);
  const location = useLocation();
  if (!ready) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  if (!isStaff) return <Forbidden />;
  return <Outlet />;
}

/** Sign-in pages: already signed-in people go to the right home for their role. */
export function GuestOnly({ admin = false }) {
  const ready = useSelector(selectAuthReady);
  const user = useSelector(selectUser);
  const isStaff = useSelector(selectIsStaff);
  if (!ready) return <PageLoader />;
  if (user && isStaff) return <Navigate to="/admin/dashboard" replace />;
  if (user && !admin) return <Navigate to="/profile" replace />;
  return <Outlet />;
}
