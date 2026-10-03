import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { RouteFallback } from "./ui/RouteFallback";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const status = useSelector((state: any) => state.auth.status);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  if (status === "idle" || status === "loading") {
    return <RouteFallback />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}