import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const status = useSelector((state: any) => state.auth.status);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}