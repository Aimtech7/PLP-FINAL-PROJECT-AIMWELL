// Import React hooks and UI components
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Import Lucide React icons for UI elements
import { Heart, BookOpen, Brain, Video, Shield, Star, Users, TrendingUp } from 'lucide-react';

// Import custom components for different sections of the platform
import Dashboard from '@/components/Dashboard';
import HealthModule from '@/components/HealthModule';
import EducationModule from '@/components/EducationModule';
import AIAssistant from '@/components/AIAssistant';
import PaymentPlans from '@/components/PaymentPlans';
import AdminDashboard from '@/components/AdminDashboard';

// Main Index component - serves as the landing page and navigation hub
export default function Index() {
  // State management for current view (landing, dashboard, admin)
  const [currentView, setCurrentView] = useState('landing');
  // State to track user type (regular user or admin)
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);

  // Conditional rendering: Show user dashboard if user is logged in as regular user
  if (currentView === 'dashboard' && userType === 'user') {
    return <Dashboard onBack={() => setCurrentView('landing')} />;
  }

  // Conditional rendering: Show admin dashboard if user is logged in as admin
  if (currentView === 'admin' && userType === 'admin') {
    return <AdminDashboard onBack={() => setCurrentView('landing')} />;
  }

  // Main landing page JSX structure
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Section - Navigation and branding */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo and brand name */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              EduWell
            </h1>
          </div>
          
          {/* Navigation buttons for demo access */}
          <div className="flex items-center space-x-4">
            {/* Demo user login button */}
            <Button variant="outline" onClick={() => {
              setUserType('user');
              setCurrentView('dashboard');
            }}>
              Demo Login
            </Button>
            {/* Admin demo login button */}
            <Button onClick={() => {
              setUserType('admin');
              setCurrentView('admin');
            }}>
              Admin Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Main value proposition and call-to-action */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          {/* Platform type badge */}
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-green-600">
            🚀 Full-Stack Platform
          </Badge>
          
          {/* Main headline with gradient text effect */}
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            Education + Health + AI
          </h2>
          
          {/* Platform description */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive platform combining learning, telehealth, AI assistance, and wellness tracking. 
            Built with Django, PostgreSQL, Redis, and cutting-edge AI integration.
          </p>
          
          {/* Call-to-action buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {/* Primary CTA - Demo access */}
            <Button size="lg" onClick={() => {
              setUserType('user');
              setCurrentView('dashboard');
            }} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              Try Demo Account
            </Button>
            {/* Secondary CTA - Video demo */}
            <Button size="lg" variant="outline">
              Watch Demo Video
            </Button>
          </div>
        </div>
      </section>

      {/* Features Overview Section - Highlight key platform capabilities */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Platform Features</h3>
          
          {/* Feature cards grid - responsive layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Health & Telehealth feature card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="w-8 h-8 text-red-500 mb-2" />
                <CardTitle>Health & Telehealth</CardTitle>
                <CardDescription>
                  Video consultations, symptom checker, prescriptions, nutrition tracking
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Education Hub feature card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-blue-500 mb-2" />
                <CardTitle>Education Hub</CardTitle>
                <CardDescription>
                  Courses, certifications, study rooms, gamified learning challenges
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* AI Assistant feature card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="w-8 h-8 text-purple-500 mb-2" />
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  OpenAI chatbots, mental health support, personalized recommendations
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Secure Payments feature card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-8 h-8 text-green-500 mb-2" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Stripe, PayPal, M-Pesa integration with instant activation
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Stack Section - Showcase technical implementation */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Technology Stack</h3>
          
          {/* Tech stack cards - organized by category */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Backend & APIs technology card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Backend & APIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Django + Django REST Framework</li>
                  <li>• Django Channels (Real-time)</li>
                  <li>• Celery + Redis (Async tasks)</li>
                  <li>• PostgreSQL (Primary DB)</li>
                  <li>• AWS S3 (File storage)</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Integrations technology card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• OpenAI API (AI features)</li>
                  <li>• Twilio (Video calls)</li>
                  <li>• Stripe + PayPal + M-Pesa</li>
                  <li>• Infermedica (Symptom checker)</li>
                  <li>• Nutrition API</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Frontend & Mobile technology card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  Frontend & Mobile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Django Templates + HTMX</li>
                  <li>• TailwindCSS styling</li>
                  <li>• Kivy/BeeWare (Mobile)</li>
                  <li>• JWT Authentication</li>
                  <li>• Docker deployment</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section - Import and display payment plans component */}
      <PaymentPlans />

      {/* Demo Accounts Section - Provide easy access to demo functionality */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8">Demo Accounts Available</h3>
          
          {/* Demo account cards grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* User demo account card */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Demo Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Experience the full platform as a premium user with access to all features
                </p>
                {/* User demo access button */}
                <Button onClick={() => {
                  setUserType('user');
                  setCurrentView('dashboard');
                }} className="w-full">
                  Access User Demo
                </Button>
              </CardContent>
            </Card>
            
            {/* Admin demo account card */}
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Admin Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  View analytics, revenue, user feedback, and platform management tools
                </p>
                {/* Admin demo access button */}
                <Button onClick={() => {
                  setUserType('admin');
                  setCurrentView('admin');
                }} variant="outline" className="w-full">
                  Access Admin Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Section - Branding and platform information */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          {/* Footer logo and brand */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">EduWell</h1>
          </div>
          
          {/* Footer description */}
          <p className="text-gray-400 mb-4">
            Comprehensive Education + Health + AI Platform
          </p>
          
          {/* Technology stack mention */}
          <p className="text-sm text-gray-500">
            Built with Django, PostgreSQL, Redis, OpenAI, and modern web technologies
          </p>
        </div>
      </footer>
    </div>
  );
}