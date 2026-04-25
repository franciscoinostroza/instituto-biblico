import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { Rol } from "@/types";

export const ProtectedRoute = ({ allowed }: { allowed?: Rol[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (allowed && !allowed.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
