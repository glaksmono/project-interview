import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

export function RequireAuth({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate to={user.role === "lender" ? "/loans" : "/products"} replace />
    );
  }
  return <Outlet />;
}

export function RedirectIfAuth() {
  const { user } = useAuth();
  if (user)
    return (
      <Navigate to={user.role === "lender" ? "/loans" : "/products"} replace />
    );
  return <Outlet />;
}
