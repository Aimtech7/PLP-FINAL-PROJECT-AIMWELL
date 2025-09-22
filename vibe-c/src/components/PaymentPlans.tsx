import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, Star, CreditCard, Smartphone, 
  Globe, Shield, Zap, Crown
} from 'lucide-react';

export default function PaymentPlans() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Choose Your Plan</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Flexible pricing with multiple payment options including Stripe, PayPal, and M-Pesa for instant activation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Free</span>
                <Badge variant="outline">Basic</Badge>
              </CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-gray-600">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Basic health tracking</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">3 free courses</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Community access</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Basic AI chat</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Prescription Plan */}
          <Card className="relative border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Prescription Access</span>
                <Badge className="bg-orange-100 text-orange-800">Kenya</Badge>
              </CardTitle>
              <CardDescription>Unlock secure prescription storage</CardDescription>
              <div className="text-3xl font-bold">
                Ksh500<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Everything in Free</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Secure prescription storage</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Medical record access</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
              <div className="space-y-2">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Pay with M-Pesa
                </Button>
                <p className="text-xs text-center text-gray-600">
                  Instant activation via M-Pesa push
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-blue-200 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Premium</span>
                <Crown className="w-5 h-5 text-yellow-500" />
              </CardTitle>
              <CardDescription>Full access to all features</CardDescription>
              <div className="text-3xl font-bold">
                $12<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Everything in previous plans</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Unlimited courses & certificates</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Video consultations</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Advanced AI features</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Priority booking</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm">Personalized meal plans</span>
                </li>
              </ul>
              <div className="space-y-2">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <CreditCard className="w-3 h-3 mr-1" />
                    Stripe
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Globe className="w-3 h-3 mr-1" />
                    PayPal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Security */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-6 text-gray-600">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              <span className="text-sm">Instant Activation</span>
            </div>
            <div className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              <span className="text-sm">Global Access</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto">
            All payments are processed securely through industry-leading providers. 
            M-Pesa payments are confirmed instantly via Daraja API integration.
          </p>
        </div>
      </div>
    </section>
  );
}