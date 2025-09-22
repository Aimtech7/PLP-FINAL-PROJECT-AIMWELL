import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, TrendingUp, Users, DollarSign, Activity,
  MessageSquare, Star, Eye, Download, Settings,
  Calendar, AlertCircle, CheckCircle, Clock
} from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-xl font-bold">EduWell Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Platform management and analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-red-100 text-red-800 border-red-200">
              Super Admin
            </Badge>
            <Avatar>
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">$24,847</p>
                  <p className="text-xs text-green-600">+12.5% this month</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                  <p className="text-xs text-blue-600">+8.2% this week</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Subscriptions</p>
                  <p className="text-2xl font-bold text-purple-600">892</p>
                  <p className="text-xs text-purple-600">+15.3% this month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Platform Health</p>
                  <p className="text-2xl font-bold text-green-600">99.8%</p>
                  <p className="text-xs text-green-600">Uptime</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="demo-accounts">Demo Accounts</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* User Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly active users and registrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>New Registrations</span>
                        <span>234 this month</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Premium Conversions</span>
                        <span>67 this month</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>User Retention</span>
                        <span>85% monthly</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Feature Usage</CardTitle>
                  <CardDescription>Most popular platform features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Assistant</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={92} className="w-20 h-2" />
                        <span className="text-sm text-gray-600">92%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Health Tracking</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={78} className="w-20 h-2" />
                        <span className="text-sm text-gray-600">78%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Course Enrollment</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={65} className="w-20 h-2" />
                        <span className="text-sm text-gray-600">65%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Video Consultations</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={43} className="w-20 h-2" />
                        <span className="text-sm text-gray-600">43%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registration spike</p>
                      <p className="text-xs text-gray-600">45 new users in the last hour</p>
                    </div>
                    <span className="text-xs text-gray-500">2 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Premium subscription purchased</p>
                      <p className="text-xs text-gray-600">User upgraded via M-Pesa payment</p>
                    </div>
                    <span className="text-xs text-gray-500">5 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">High server load detected</p>
                      <p className="text-xs text-gray-600">Auto-scaling activated successfully</p>
                    </div>
                    <span className="text-xs text-gray-500">15 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Monthly revenue by payment method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Stripe Payments</p>
                        <p className="text-sm text-gray-600">Premium subscriptions ($12/month)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">$18,240</p>
                        <p className="text-xs text-gray-600">1,520 subscribers</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">M-Pesa Payments</p>
                        <p className="text-sm text-gray-600">Prescription access (Ksh500/month)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">$4,167</p>
                        <p className="text-xs text-gray-600">1,250 subscribers</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">PayPal Payments</p>
                        <p className="text-sm text-gray-600">International users</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">$2,440</p>
                        <p className="text-xs text-gray-600">203 subscribers</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Analytics</CardTitle>
                  <CardDescription>Transaction success rates and trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>M-Pesa Success Rate</span>
                        <span>98.7%</span>
                      </div>
                      <Progress value={98.7} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stripe Success Rate</span>
                        <span>99.2%</span>
                      </div>
                      <Progress value={99.2} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>PayPal Success Rate</span>
                        <span>97.8%</span>
                      </div>
                      <Progress value={97.8} className="h-2" />
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">Average processing time: 2.3 seconds</p>
                    <p className="text-sm text-gray-600">Failed transactions: 23 this month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>User Feedback</span>
                  <Badge className="bg-blue-100 text-blue-800">127 new</Badge>
                </CardTitle>
                <CardDescription>Recent user feedback and ratings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">John Doe</p>
                        <div className="flex items-center space-x-1">
                          <div className="flex text-yellow-400">
                            {'★'.repeat(5)}
                          </div>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        "The AI assistant is incredibly helpful for managing my health goals. 
                        The symptom checker gave me peace of mind before my doctor visit."
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">AI Assistant</Badge>
                        <Badge variant="outline" className="text-xs">Health</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Avatar>
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">Sarah Martinez</p>
                        <div className="flex items-center space-x-1">
                          <div className="flex text-yellow-400">
                            {'★'.repeat(4)}★
                          </div>
                          <span className="text-xs text-gray-500">5 hours ago</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        "Love the course variety and the certificate system. 
                        M-Pesa integration works perfectly for Kenyan users!"
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">Education</Badge>
                        <Badge variant="outline" className="text-xs">Payments</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg bg-red-50">
                    <Avatar>
                      <AvatarFallback>MK</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">Michael Kim</p>
                        <div className="flex items-center space-x-1">
                          <div className="flex text-yellow-400">
                            {'★'.repeat(2)}★★★
                          </div>
                          <span className="text-xs text-gray-500">1 day ago</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        "Video consultation quality could be improved. 
                        Sometimes the connection drops during important discussions."
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">Telehealth</Badge>
                        <Badge className="bg-red-100 text-red-800 text-xs">Issue</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demo-accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demo Account Management</CardTitle>
                <CardDescription>Pre-configured demo accounts for platform demonstration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Premium Demo Accounts</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">demo1@eduwell.com</p>
                          <p className="text-xs text-gray-600">Password: Demo123!</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">demo2@eduwell.com</p>
                          <p className="text-xs text-gray-600">Password: Demo123!</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">demo3@eduwell.com</p>
                          <p className="text-xs text-gray-600">Password: Demo123!</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Admin Account</h4>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="space-y-2">
                        <p className="font-medium text-sm">admin@eduwell.com</p>
                        <p className="text-xs text-gray-600">Password: AdminSecure2024!</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className="bg-red-100 text-red-800">Super Admin</Badge>
                          <Badge variant="outline">Full Access</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Account Features:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Full platform access</li>
                        <li>• Revenue analytics</li>
                        <li>• User management</li>
                        <li>• System monitoring</li>
                        <li>• Feedback management</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Real-time system performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Django Backend</span>
                        <span className="text-green-600">Healthy</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>PostgreSQL Database</span>
                        <span className="text-green-600">Optimal</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Redis Cache</span>
                        <span className="text-green-600">Running</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Celery Workers</span>
                        <span className="text-yellow-600">Busy</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Integration Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Status</CardTitle>
                  <CardDescription>External service connections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">OpenAI API</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Twilio Video</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Stripe Payments</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">M-Pesa Daraja</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AWS S3</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Infermedica API</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Limited</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}