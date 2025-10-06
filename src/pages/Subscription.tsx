import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id?: string;
  subscription_end?: string;
}

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'KES',
    interval: 'forever',
    product_id: null,
    price_id: null,
    icon: Shield,
    popular: false,
    features: [
      'Access to basic courses',
      'Community forum access',
      'Basic health tracking',
      'Limited AI consultations (5/month)',
      'Email support',
    ],
  },
  basic: {
    name: 'Basic',
    price: 999,
    currency: 'KES',
    interval: 'month',
    price_id: 'price_basic_monthly',
    product_id: 'prod_basic',
    icon: Sparkles,
    popular: false,
    features: [
      'Everything in Free',
      'Access to premium courses',
      'Priority community access',
      'Advanced health tracking',
      'Unlimited AI consultations',
      'Personalized meal plans',
      'Email & chat support',
    ],
  },
  premium: {
    name: 'Premium',
    price: 1999,
    currency: 'KES',
    interval: 'month',
    price_id: 'price_premium_monthly',
    product_id: 'prod_premium',
    icon: Crown,
    popular: true,
    features: [
      'Everything in Basic',
      'Exclusive masterclasses',
      'One-on-one health coaching',
      'Custom workout plans',
      'Nutrition consultation',
      'Certificate priority processing',
      'Priority support (24/7)',
      'Early access to new features',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 4999,
    currency: 'KES',
    interval: 'month',
    price_id: 'price_enterprise_monthly',
    product_id: 'prod_enterprise',
    icon: Zap,
    popular: false,
    features: [
      'Everything in Premium',
      'Dedicated health coach',
      'Custom course creation',
      'Team management (up to 10 members)',
      'Advanced analytics & reporting',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
  },
};

const Subscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
  });
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) {
      setCheckingSubscription(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to subscribe',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { price_id: priceId },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: 'Redirecting to checkout',
          description: `Opening Stripe checkout for ${planName} plan`,
        });
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Error',
        description: 'Failed to open subscription management',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlan = () => {
    if (!subscriptionStatus.subscribed) return 'free';
    return Object.entries(PLANS).find(
      ([_, plan]) => plan.product_id === subscriptionStatus.product_id
    )?.[0] || 'free';
  };

  const currentPlanKey = getCurrentPlan();

  if (checkingSubscription) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">
          Unlock your full potential with our comprehensive health and education platform
        </p>
      </div>

      {/* Current Plan Banner */}
      {subscriptionStatus.subscribed && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Current Plan: {PLANS[currentPlanKey as keyof typeof PLANS].name}</h3>
                <p className="text-sm text-muted-foreground">
                  {subscriptionStatus.subscription_end && 
                    `Renews on ${new Date(subscriptionStatus.subscription_end).toLocaleDateString()}`
                  }
                </p>
              </div>
            </div>
            <Button onClick={handleManageSubscription} disabled={loading} variant="outline">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(PLANS).map(([key, plan]) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlanKey === key;
          const isFree = key === 'free';

          return (
            <Card
              key={key}
              className={`relative ${
                plan.popular
                  ? 'border-primary shadow-lg scale-105'
                  : isCurrentPlan
                  ? 'border-success'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="outline" className="bg-success text-success-foreground border-success">
                    Your Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <div className="text-3xl font-bold text-foreground">
                    {plan.currency} {plan.price.toLocaleString()}
                  </div>
                  <div className="text-sm">per {plan.interval}</div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  disabled={loading || isCurrentPlan || isFree}
                  onClick={() => !isFree && handleSubscribe(plan.price_id!, plan.name)}
                >
                  {isCurrentPlan
                    ? 'Current Plan'
                    : isFree
                    ? 'Free Forever'
                    : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade, downgrade, or cancel your subscription at any time through the
              customer portal.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept credit/debit cards, M-Pesa, and other payment methods through Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Is there a refund policy?</h4>
            <p className="text-sm text-muted-foreground">
              We offer a 14-day money-back guarantee. Contact support for assistance.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Do you offer discounts for annual plans?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Annual plans save you 20%. Contact our sales team for more information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscription;
