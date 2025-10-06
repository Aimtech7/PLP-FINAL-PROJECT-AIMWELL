import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, User, CreditCard, Bell, Shield, Save } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';

interface ProfileData {
  first_name: string;
  last_name: string;
  phone: string;
  height_cm: number | null;
  weight_kg: number | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  location: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  current_medications: string | null;
  medical_history: string | null;
  emergency_contact: string | null;
  emergency_contact_phone: string | null;
}

interface SubscriptionData {
  subscription_status: string;
  premium_until: string | null;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    phone: '',
    height_cm: null,
    weight_kg: null,
    date_of_birth: null,
    gender: null,
    blood_type: null,
    location: null,
    allergies: null,
    chronic_conditions: null,
    current_medications: null,
    medical_history: null,
    emergency_contact: null,
    emergency_contact_phone: null,
  });
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscription_status: 'free',
    premium_until: null,
  });

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          height_cm: data.height_cm,
          weight_kg: data.weight_kg,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          blood_type: data.blood_type,
          location: data.location,
          allergies: data.allergies,
          chronic_conditions: data.chronic_conditions,
          current_medications: data.current_medications,
          medical_history: data.medical_history,
          emergency_contact: data.emergency_contact,
          emergency_contact_phone: data.emergency_contact_phone,
        });
        setSubscriptionData({
          subscription_status: data.subscription_status || 'free',
          premium_until: data.premium_until,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Sun className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+254 712 345 678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth || ''}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={profileData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    placeholder="Male/Female/Other"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Information</CardTitle>
              <CardDescription>This helps our AI provide better health recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input
                    id="height_cm"
                    type="number"
                    value={profileData.height_cm || ''}
                    onChange={(e) => handleInputChange('height_cm', parseFloat(e.target.value) || null)}
                    placeholder="170"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_kg">Weight (kg)</Label>
                  <Input
                    id="weight_kg"
                    type="number"
                    value={profileData.weight_kg || ''}
                    onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value) || null)}
                    placeholder="70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Blood Type</Label>
                  <Input
                    id="blood_type"
                    value={profileData.blood_type || ''}
                    onChange={(e) => handleInputChange('blood_type', e.target.value)}
                    placeholder="A+, B-, O+, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={profileData.allergies || ''}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="List any allergies you have..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
                <Textarea
                  id="chronic_conditions"
                  value={profileData.chronic_conditions || ''}
                  onChange={(e) => handleInputChange('chronic_conditions', e.target.value)}
                  placeholder="List any chronic conditions..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_medications">Current Medications</Label>
                <Textarea
                  id="current_medications"
                  value={profileData.current_medications || ''}
                  onChange={(e) => handleInputChange('current_medications', e.target.value)}
                  placeholder="List medications you're currently taking..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_history">Medical History</Label>
                <Textarea
                  id="medical_history"
                  value={profileData.medical_history || ''}
                  onChange={(e) => handleInputChange('medical_history', e.target.value)}
                  placeholder="Brief medical history..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Person to contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Contact Name</Label>
                  <Input
                    id="emergency_contact"
                    value={profileData.emergency_contact || ''}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={profileData.emergency_contact_phone || ''}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    placeholder="+254 712 345 678"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleProfileUpdate} disabled={loading} className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg capitalize">{subscriptionData.subscription_status} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionData.premium_until 
                      ? `Active until ${new Date(subscriptionData.premium_until).toLocaleDateString()}`
                      : 'No expiration'}
                  </p>
                </div>
                <Badge variant={subscriptionData.subscription_status === 'premium' ? 'default' : 'secondary'}>
                  {subscriptionData.subscription_status === 'premium' ? 'Active' : 'Free'}
                </Badge>
              </div>

              {subscriptionData.subscription_status === 'free' && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Upgrade to Premium</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get access to exclusive courses, personalized health plans, and priority support.
                    </p>
                    <Button className="w-full">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose your preferred payment platform
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    💳 Credit/Debit Card
                  </Button>
                  <Button variant="outline" className="justify-start">
                    📱 M-Pesa
                  </Button>
                  <Button variant="outline" className="justify-start">
                    💰 PayPal
                  </Button>
                  <Button variant="outline" className="justify-start">
                    🏦 Bank Transfer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize the appearance of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label>Theme Preview</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                      className="flex flex-col gap-2 h-auto p-4"
                    >
                      <Sun className="h-6 w-6" />
                      <span className="text-xs">Light</span>
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                      className="flex flex-col gap-2 h-auto p-4"
                    >
                      <Moon className="h-6 w-6" />
                      <span className="text-xs">Dark</span>
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      onClick={() => setTheme('system')}
                      className="flex flex-col gap-2 h-auto p-4"
                    >
                      <Shield className="h-6 w-6" />
                      <span className="text-xs">System</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Course Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new courses and updates
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-0.5">
                  <Label>Health Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive health tips and reminders
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-0.5">
                  <Label>Community Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about community posts and comments
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;