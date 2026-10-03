import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { RouteFallback } from "./ui/RouteFallback";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const status = useSelector((state: any) => state.auth.status);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const userRole = useSelector((state: any) => state.auth.user?.userRole);

  if (status === "idle" || status === "loading") {
    return <RouteFallback />;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}