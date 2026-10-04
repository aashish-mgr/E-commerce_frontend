import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { VerificationStatus } from "../types";
import { authAPI } from "../api";
import { showErrorToast } from "../lib/toast";
import { StatusPanel } from "../Components/ui/StatusPanel";
import { Button } from "../Components/ui/Button";

const COPY: Record<VerificationStatus, { title: string; description: string }> = {
  verifying: {
    title: "Verifying your payment",
    description: "Khalti is confirming the transaction. This only takes a moment.",
  },
  success: {
    title: "Payment verified",
    description: "Your order is confirmed. Taking you to it now.",
  },
  failed: {
    title: "Payment verification failed",
    description:
      "We could not confirm this payment. If an amount was deducted, it will be refunded shortly.",
  },
};

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>("verifying");

  useEffect(() => {
    const verify = async () => {
      const pidx = searchParams.get("pidx");

      if (!pidx) {
        setStatus("failed");
        return;
      }

      try {
        const res = await authAPI.post("/order/verify", {
          pidx,
        });

        if (res.status === 200) {
          setStatus("success");
          setTimeout(() => navigate(`/orderDetail/${res.data?.data?.Order?.id}`), 1500);
        } else {
          setStatus("failed");
        }
      } catch (error) {
        showErrorToast(error, "Payment verification failed.");
        setStatus("failed");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <StatusPanel
      variant={status}
      title={COPY[status].title}
      description={COPY[status].description}
      actions={
        status === "failed" ? (
          <Button variant="primary" onClick={() => navigate("/cart")}>
            Return to cart
          </Button>
        ) : undefined
      }
    />
  );
};

export default PaymentCallback;