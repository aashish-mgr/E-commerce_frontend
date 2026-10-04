import { useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { API_BASE } from "../api";
import { loginUser, registerUser } from "../store/authSlice";
import { Dialog, DialogContent } from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { RadioGroup, RadioCard } from "./ui/RadioGroup";

const ROLES = [
  { value: "customer", label: "Buyer" },
  { value: "vendor", label: "Seller" },
];

const AuthModal = ({ mode, onClose, onSwitch, onLogin }: any) => {
  const dispatch = useDispatch<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "register") {
      dispatch(
        registerUser({
          userName: name,
          userEmail: email,
          userPassword: password,
          userRole: role,
        })
      );
    } else if (onLogin) {
      onLogin(email, password);
    } else {
      dispatch(
        loginUser({
          userEmail: email,
          userPassword: password,
        })
      );
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        title={mode === "login" ? "Welcome back" : "Create your account"}
        description={
          mode === "login"
            ? "Sign in to reach your cart, orders and saved details."
            : "Shop as a buyer, or open a storefront as a seller."
        }
      >
        <form className="flex flex-col gap-4 p-5" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-sm font-medium text-ink">I want to</legend>
                <RadioGroup
                  value={role}
                  onValueChange={setRole}
                  aria-label="Account type"
                  orientation="horizontal"
                  className="grid grid-cols-2 gap-2"
                >
                  {ROLES.map((r) => (
                    <RadioCard key={r.value} value={r.value}>
                      <span className="text-sm font-medium text-ink">{r.label}</span>
                    </RadioCard>
                  ))}
                </RadioGroup>
              </fieldset>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="auth-name" className="text-sm font-medium text-ink">
                  Full name
                </label>
                <Input
                  id="auth-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sita Gurung"
                  autoComplete="name"
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className="text-sm font-medium text-ink">
              Email address
            </label>
            <Input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-password" className="text-sm font-medium text-ink">
              Password
            </label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>

          <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted">
            {mode === "login" ? "No account yet?" : "Already registered?"}{" "}
            <button
              type="button"
              onClick={onSwitch}
              className="rounded-control font-medium text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;