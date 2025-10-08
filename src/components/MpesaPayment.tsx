import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Smartphone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MpesaPaymentProps {
  amount: number;
  accountReference: string;
  transactionDesc: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export function MpesaPayment({
  amount,
  accountReference,
  transactionDesc,
  onSuccess,
  onError,
}: MpesaPaymentProps) {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle');

  const formatPhoneNumber = (input: string): string => {
    let cleaned = input.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      cleaned = '254' + cleaned;
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
    }

    return cleaned;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^254[17]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const checkPaymentStatus = async (txId: string) => {
    try {
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select('status, mpesa_receipt_number, result_desc')
        .eq('id', txId)
        .single();

      if (error) {
        console.error('Error checking payment status:', error);
        return;
      }

      if (data.status === 'completed') {
        setPaymentStatus('completed');
        toast({
          title: 'Payment Successful!',
          description: `M-Pesa Receipt: ${data.mpesa_receipt_number}`,
        });
        if (onSuccess) {
          onSuccess(txId);
        }
      } else if (data.status === 'failed') {
        setPaymentStatus('failed');
        toast({
          title: 'Payment Failed',
          description: data.result_desc || 'Transaction failed',
          variant: 'destructive',
        });
        if (onError) {
          onError(data.result_desc || 'Transaction failed');
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPaymentStatus('idle');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      if (!validatePhoneNumber(formattedPhone)) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Please enter a valid Kenyan phone number (07XXXXXXXX or 01XXXXXXXX)',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phoneNumber: formattedPhone,
          amount: amount,
          accountReference: accountReference,
          transactionDesc: transactionDesc,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success) {
        setTransactionId(data.transactionId);
        setCheckoutRequestId(data.checkoutRequestId);
        setPaymentStatus('pending');

        toast({
          title: 'Payment Request Sent',
          description: 'Please check your phone and enter your M-Pesa PIN to complete the payment.',
        });

        const statusCheckInterval = setInterval(() => {
          checkPaymentStatus(data.transactionId);
        }, 3000);

        setTimeout(() => {
          clearInterval(statusCheckInterval);
          if (paymentStatus === 'pending') {
            setPaymentStatus('failed');
            toast({
              title: 'Payment Timeout',
              description: 'Payment request timed out. Please try again.',
              variant: 'destructive',
            });
          }
        }, 60000);
      }
    } catch (error: any) {
      console.error('M-Pesa payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
      setPaymentStatus('failed');
      if (onError) {
        onError(error.message || 'Payment failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Pay with M-Pesa
        </CardTitle>
        <CardDescription>
          Enter your M-Pesa registered phone number to complete payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="text"
              value={`KES ${amount.toLocaleString()}`}
              disabled
              className="font-semibold text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="07XXXXXXXX or 01XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading || paymentStatus === 'pending'}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your M-Pesa registered phone number
            </p>
          </div>

          {paymentStatus === 'idle' && (
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initiating Payment...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2 h-4 w-4" />
                  Pay KES {amount.toLocaleString()}
                </>
              )}
            </Button>
          )}

          {paymentStatus === 'pending' && (
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Payment request sent!</strong>
                <br />
                Check your phone and enter your M-Pesa PIN to complete the payment.
                <br />
                <span className="text-xs">Waiting for payment confirmation...</span>
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'completed' && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Payment Successful!</strong>
                <br />
                Your payment has been received and processed.
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'failed' && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Payment Failed</strong>
                <br />
                Please try again or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === 'failed' && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setPaymentStatus('idle');
                setTransactionId(null);
                setCheckoutRequestId(null);
              }}
            >
              Try Again
            </Button>
          )}
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Powered by M-Pesa
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {accountReference} - {transactionDesc}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
