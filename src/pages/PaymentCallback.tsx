import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { VerificationStatus } from '../types';
import {authAPI } from '../api';
import { showErrorToast } from '../lib/toast';


const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('verifying');

  useEffect(() => {
    const verify = async () => {
      const pidx = searchParams.get('pidx');

      if (!pidx) {
        setStatus('failed');
        return;
      }

      try {
     const res = await authAPI.post("/order/verify",{
                 pidx,
             });

   

        if (res.status === 200) {
          setStatus('success');
          setTimeout(() => navigate(`/orderDetail/${res.data?.data?.Order?.id}`), 1500);
        } else {
          setStatus('failed');
        }
      } catch (error) {
        showErrorToast(error, "Payment verification failed.");
        setStatus('failed');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-gray-200 border-t-indigo-600 animate-spin" />
            <h2 className="text-base font-medium text-gray-900">Verifying your payment</h2>
            <p className="mt-1 text-sm text-gray-500">This will only take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-base font-medium text-gray-900">Payment verified</h2>
            <p className="mt-1 text-sm text-gray-500">Redirecting to your order...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-base font-medium text-gray-900">Payment verification failed</h2>
            <p className="mt-1 text-sm text-gray-500">
              We couldn't confirm this payment. If an amount was deducted, it will be refunded shortly.
            </p>
            <button
              onClick={() => navigate('/cart')}
              className="mt-6 w-full rounded-xl bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 transition-colors"
            >
              Return to cart
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;