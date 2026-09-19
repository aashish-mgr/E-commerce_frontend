// pages/AuthComplete.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { restoreSession } from '../store/authSlice';

export default function AuthComplete() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(restoreSession() as any)
      .then((user: any) => {
        if (user?.userRole === "admin") {
          navigate("/admin", { replace: true });
        } else if (user?.userRole === "vendor") {
          navigate("/vendor/dashboard", { replace: true });
        } else if (user) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login?error=session_failed", { replace: true });
        }
      })
      .catch(() => navigate("/login?error=session_failed", { replace: true }));
  }, [dispatch, navigate]);

  return <div>Signing you in…</div>; // spinner/loading UI
}