import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function VendorRoute({ children }: { children: ReactNode }) {
  const status = useSelector((state: any) => state.auth.status);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const userRole = useSelector((state: any) => state.auth.user?.userRole);

  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole !== "vendor") return <Navigate to="/dashboard" replace />;
  return children;
}