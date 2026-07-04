import { useNavigate } from "react-router-dom";

const OrderSuccess = ({
  orderId,
  onBack,
}: {
  orderId: string;
  onBack: () => void;
}) => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg
            width="30"
            height="30"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 text-sm mb-1">
          Your order has been placed successfully.
        </p>
        <p className="text-indigo-600 font-semibold text-sm mb-6">{orderId}</p>
        {/* <p className="text-xs text-gray-400 mb-8">
          A confirmation will be sent to{" "}
          <span className="font-medium text-gray-600">
            {CURRENT_USER.userEmail}
          </span>
        </p> */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
            onClick={() => navigate(`/orderDetail/${orderId}`)}
          >
            Track Order
          </button>
          <button
            onClick={onBack}
            className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess