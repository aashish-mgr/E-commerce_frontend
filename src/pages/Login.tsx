import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AuthModal from "../Components/AuthModal";
import { loginUser } from "../store/authSlice";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const handleLogin = async (userEmail: string, userPassword: string) => {
    const result = await dispatch(loginUser({ userEmail, userPassword }));
    if (result?.userRole === "admin") {
      navigate("/admin", { replace: true });
    } else if (result?.userRole === "vendor") {
      navigate("/vendor/dashboard", { replace: true });
    } else if (result) {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <AuthModal
        mode={mode}
        onClose={() => navigate("/")}
        onSwitch={() => setMode((m) => (m === "login" ? "register" : "login"))}
        onLogin={handleLogin}
      />
    </div>
  );
}