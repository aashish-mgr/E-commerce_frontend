import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser,  registerUser } from "../store/authSlice";
import { API_BASE } from "../api";

const AuthModal = ({ mode, onClose, onSwitch, onLogin }: any) => {
  const dispatch = useDispatch<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const handleGoogleLogin = () => {
  window.location.href =
    `${API_BASE}/auth/google`;
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm p-7 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          {mode === "register" && (
            <>
              <div className="flex gap-2">
                {["customer", "vendor"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize border transition-colors ${
                      role === r
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-200 text-gray-600 hover:border-gray-900"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
          {mode === "login" && (
            <a
              href="#"
              className="text-right text-xs text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              if (mode === "register") {
                dispatch(
                  registerUser({
                    userName: name,
                    userEmail: email,
                    userPassword: password,
                    userRole: role,
                  }),
                );
              } else if (onLogin) {
                onLogin(email, password);
              } else {
                dispatch(
                  loginUser({
                    userEmail: email,
                    userPassword: password,
                  }),
                );
              }
            }}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-700 transition-colors mt-1"
          >
            {mode === "login" ? "Sign In" : "Register"}
          </button>
          
        </div>

        {/* Switch mode */}
        <p className="text-center text-sm text-gray-500 mt-5">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={onSwitch}
            className="text-indigo-600 font-medium hover:text-indigo-500"
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
        <button
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-700 transition-colors mt-1"
            onClick={() => handleGoogleLogin()}
          >
            Login with Google
          </button>
      </div>
    </div>
  );
};

export default AuthModal;
