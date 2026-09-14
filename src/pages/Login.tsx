import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthModal from "../Components/AuthModal";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const isAuthenticated = useSelector(
    (state: any) => state.auth.isAuthenticated,
  );
  const userRole = useSelector((state: any) => state.auth.user?.userRole);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(userRole === "vendor" ? "/vendor/dashboard" : "/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, userRole, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <AuthModal
        mode={mode}
        onClose={() => navigate("/")}
        onSwitch={() => setMode((m) => (m === "login" ? "register" : "login"))}
      />
    </div>
  );
}