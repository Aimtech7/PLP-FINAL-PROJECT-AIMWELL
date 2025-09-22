// Import React hooks for state management
import { useState } from 'react';
// Import Shadcn UI components for consistent design system
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Import Lucide React icons for visual elements
import { 
  Heart, BookOpen, Brain, Video, Calendar, Award, 
  Bell, Settings, LogOut, ArrowLeft, Activity,
  MessageCircle, Clock, Star, TrendingUp
} from 'lucide-react';
// Import module components for different dashboard sections
import HealthModule from './HealthModule';
import EducationModule from './EducationModule';
import AIAssistant from './AIAssistant';

// TypeScript interface for component props
interface DashboardProps {
  onBack: () => void; // Function to navigate back to landing page
}

// Main Dashboard component - User's personalized control center
export default function Dashboard({ onBack }: DashboardProps) {
  // State to track which tab/module is currently active
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Navigation and user info */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Left side: Back button and branding */}
          <div className="flex items-center space-x-4">
            {/* Back to home button */}
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            {/* Dashboard branding */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">EduWell Dashboard</h1>
            </div>
          </div>
          
          {/* Right side: User status and profile */}
          <div className="flex items-center space-x-4">
            {/* Premium subscription status badge */}
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Premium Active
            </Badge>
            
            {/* Notifications button */}
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            
            {/* User avatar */}
            <Avatar>
              <AvatarImage src="/api/placeholder/32/32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation - Module selection */}
        <aside className="w-64 bg-white border-r min-h-screen p-4">
          <nav className="space-y-2">
            {/* Overview/Dashboard home button */}
            <Button 
              variant={activeTab === 'overview' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </Button>
            
            {/* Health & Telehealth module button */}
            <Button 
              variant={activeTab === 'health' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('health')}
            >
              <Heart className="w-4 h-4 mr-2" />
              Health & Telehealth
            </Button>
            
            {/* Education Hub module button */}
            <Button 
              variant={activeTab === 'education' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('education')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Education Hub
            </Button>
            
            {/* AI Assistant module button */}
            <Button 
              variant={activeTab === 'ai' ? 'default' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('ai')}
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            
            {/* Settings button (placeholder) */}
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content Area - Dynamic based on selected tab */}
        <main className="flex-1 p-6">
          {/* Overview Tab Content - Dashboard summary */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome section with personalized greeting */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, John!</h2>
                <p className="text-gray-600">Here's your health and learning progress overview.</p>
              </div>

              {/* Quick Stats Grid - Key metrics at a glance */}
              <div className="grid md:grid-cols-4 gap-4">
                {/* Health Score metric card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Health Score</p>
                        <p className="text-2xl font-bold text-green-600">87%</p>
                      </div>
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Courses count metric card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Courses</p>
                        <p className="text-2xl font-bold text-blue-600">12</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Certificates earned metric card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Certificates</p>
                        <p className="text-2xl font-bold text-purple-600">5</p>
                      </div>
                      <Award className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Learning streak metric card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Streak</p>
                        <p className="text-2xl font-bold text-orange-600">23</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Section - Two-column layout */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Health Activities card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Health Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Activity timeline with colored indicators */}
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Completed daily health check</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Video consultation with Dr. Smith</p>
                        <p className="text-xs text-gray-500">Yesterday</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Prescription uploaded to profile</p>
                        <p className="text-xs text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Progress card with progress bars */}
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Course progress indicators */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Python for Healthcare</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mental Health Basics</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Nutrition Science</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Appointments Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Appointment card with doctor info and join button */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {/* Doctor avatar */}
                        <Avatar>
                          <AvatarFallback>DS</AvatarFallback>
                        </Avatar>
                        
                        {/* Appointment details */}
                        <div>
                          <p className="font-medium">Dr. Sarah Johnson</p>
                          <p className="text-sm text-gray-600">General Consultation</p>
                        </div>
                      </div>
                      
                      {/* Appointment time and action */}
                      <div className="text-right">
                        <p className="text-sm font-medium">Tomorrow, 2:00 PM</p>
                        <Button size="sm" className="mt-1">
                          <Video className="w-4 h-4 mr-1" />
                          Join Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Conditional rendering for different modules */}
          {/* Health module - comprehensive health and telehealth features */}
          {activeTab === 'health' && <HealthModule />}
          
          {/* Education module - courses, certificates, and learning */}
          {activeTab === 'education' && <EducationModule />}
          
          {/* AI Assistant module - chatbot and AI-powered features */}
          {activeTab === 'ai' && <AIAssistant />}
        </main>
      </div>
    </div>
  );
}