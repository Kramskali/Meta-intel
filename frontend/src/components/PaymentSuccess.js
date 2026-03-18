import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [paymentInfo, setPaymentInfo] = useState(null);
  
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('token'); // PayPal uses 'token'
  const provider = searchParams.get('provider');

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    if (!sessionId && !orderId) {
      setStatus('error');
      return;
    }

    try {
      if (provider === 'paypal' && orderId) {
        // Capture PayPal order
        const captureResponse = await axios.post(`${API}/payments/paypal/capture/${orderId}`);
        if (captureResponse.data.status === 'COMPLETED') {
          setStatus('success');
          setPaymentInfo(captureResponse.data);
        } else {
          setStatus('error');
        }
      } else if (sessionId) {
        // Check Stripe payment
        const statusResponse = await axios.get(`${API}/payments/status/${sessionId}`);
        if (statusResponse.data.payment_status === 'paid') {
          setStatus('success');
          setPaymentInfo(statusResponse.data);
        } else {
          setStatus('pending');
          // Retry after 2 seconds
          setTimeout(checkPaymentStatus, 2000);
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-[#0A0A0A] border-zinc-800" data-testid="payment-success-card">
        <CardContent className="p-8 text-center">
          {status === 'checking' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-cyan-400 animate-spin" />
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Verifying Payment...</h2>
              <p className="text-zinc-400">Please wait while we confirm your payment.</p>
            </>
          )}

          {status === 'pending' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-spin" />
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Processing Payment...</h2>
              <p className="text-zinc-400">Your payment is being processed. This may take a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
              <h2 className="font-heading text-2xl font-bold text-emerald-400 mb-2">Payment Successful!</h2>
              <p className="text-zinc-400 mb-6">
                Thank you for upgrading to Pro! Your account has been activated.
              </p>
              {paymentInfo && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4 mb-6 text-left">
                  <p className="text-sm text-zinc-500 mb-2">Payment Details</p>
                  {paymentInfo.amount && (
                    <p className="text-zinc-300 font-mono text-sm">
                      Amount: ${paymentInfo.amount} {paymentInfo.currency?.toUpperCase()}
                    </p>
                  )}
                  {paymentInfo.session_id && (
                    <p className="text-zinc-300 font-mono text-xs mt-1">
                      Order ID: {paymentInfo.session_id}
                    </p>
                  )}
                </div>
              )}
              <Button
                onClick={() => navigate('/')}
                className="w-full font-heading uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white"
                data-testid="return-to-dashboard-button"
              >
                Return to Dashboard
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h2 className="font-heading text-2xl font-bold text-red-400 mb-2">Payment Failed</h2>
              <p className="text-zinc-400 mb-6">
                We couldn't verify your payment. Please try again or contact support.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1 font-heading uppercase tracking-wider"
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => window.location.href = 'mailto:support@deviceintel.com'}
                  className="flex-1 font-heading uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500"
                >
                  Contact Support
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
