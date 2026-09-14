// pages/AuthComplete.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getUserProfile } from '../store/authSlice';

export default function AuthComplete() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUserProfile())
      .unwrap()
      .then((res: any) =>
        navigate(
          res?.data?.userRole === "vendor" ? "/vendor/dashboard" : "/dashboard",
          { replace: true },
        ),
      )
      .catch(() => navigate("/login?error=session_failed", { replace: true }));
  }, [dispatch, navigate]);

  return <div>Signing you in…</div>; // spinner/loading UI
}