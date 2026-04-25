import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function DashboardRedirect() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") navigate("/admin/dashboard", { replace: true });
    else if (user.role === "docente") navigate("/docente/dashboard", { replace: true });
    else if (user.role === "editor") navigate("/instituto", { replace: true });
    else navigate("/estudiante/dashboard", { replace: true });
  }, [user, navigate]);
  return null;
}
