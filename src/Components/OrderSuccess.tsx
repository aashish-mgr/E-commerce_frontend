import { useNavigate } from "react-router-dom";
import { StatusPanel } from "./ui/StatusPanel";
import { Button } from "./ui/Button";

const OrderSuccess = ({
  orderId,
  onBack,
}: {
  orderId: string;
  onBack: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <StatusPanel
      variant="success"
      title="Order placed"
      description="We have your order and the sellers have been notified. Khalti confirmed the payment, so nothing else is needed from you."
      meta={orderId}
      actions={
        <>
          <Button variant="primary" onClick={() => navigate(`/orderDetail/${orderId}`)}>
            Track this order
          </Button>
          <Button variant="ghost" onClick={onBack}>
            Continue shopping
          </Button>
        </>
      }
    />
  );
};

export default OrderSuccess;