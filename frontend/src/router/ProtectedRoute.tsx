import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  role?: "USER" | "PRODUCER";
}

export default function ProtectedRoute({
  children,
  role,
}: ProtectedRouteProps) {
  const { userRole } = useAuth();

  if (!userRole) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
