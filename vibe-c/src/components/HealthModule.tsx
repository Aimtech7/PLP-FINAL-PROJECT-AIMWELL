import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, Stethoscope, Video, Calendar, FileText, 
  Activity, Thermometer, Scale, Clock, Phone,
  AlertCircle, CheckCircle, Plus, Search
} from 'lucide-react';

export default function HealthModule() {
  const [symptoms, setSymptoms] = useState('');
  const [showSymptomResults, setShowSymptomResults] = useState(false);

  const handleSymptomCheck = () => {
    setShowSymptomResults(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Health & Telehealth</h2>
        <p className="text-gray-600">Manage your health, book consultations, and track wellness.</p>
      </div>

      {/* Quick Health Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Heart Rate</p>
                <p className="text-2xl font-bold text-red-500">72 BPM</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="text-2xl font-bold text-orange-500">98.6°F</p>
              </div>
              <Thermometer className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="text-2xl font-bold text-blue-500">165 lbs</p>
              </div>
              <Scale className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sleep</p>
                <p className="text-2xl font-bold text-purple-500">7.5h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Symptom Checker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              AI Symptom Checker
            </CardTitle>
            <CardDescription>
              Powered by Infermedica API - Describe your symptoms for preliminary assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="symptoms">Describe your symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="e.g., I have a headache and feel tired..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleSymptomCheck} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Check Symptoms
            </Button>
            
            {showSymptomResults && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Preliminary Assessment</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Based on your symptoms, this could be related to stress or mild fatigue. 
                      Consider rest and hydration. If symptoms persist, consult a healthcare provider.
                    </p>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                      Confidence: 75%
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Book Consultation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="w-5 h-5 mr-2" />
              Book Video Consultation
            </CardTitle>
            <CardDescription>
              Connect with licensed healthcare providers via Twilio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>DS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-600">General Medicine</p>
                    <div className="flex items-center mt-1">
                      <div className="flex text-yellow-400">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">(4.9)</span>
                    </div>
                  </div>
                </div>
                <Button size="sm">Book Now</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>MK</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Dr. Michael Kim</p>
                    <p className="text-sm text-gray-600">Mental Health</p>
                    <div className="flex items-center mt-1">
                      <div className="flex text-yellow-400">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                    </div>
                  </div>
                </div>
                <Button size="sm">Book Now</Button>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                View All Available Slots
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions & Medical Records */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                My Prescriptions
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                Premium Feature
              </Badge>
            </CardTitle>
            <CardDescription>
              Secure prescription storage (Ksh500/month unlocks access)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Amoxicillin 500mg</p>
                  <p className="text-sm text-gray-600">Prescribed by Dr. Johnson</p>
                  <p className="text-xs text-gray-500">Valid until: Dec 2024</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Vitamin D3 1000IU</p>
                  <p className="text-sm text-gray-600">Prescribed by Dr. Kim</p>
                  <p className="text-xs text-gray-500">Valid until: Jan 2025</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
            
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Upload New Prescription
            </Button>
          </CardContent>
        </Card>

        {/* Health Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Health Tracking
            </CardTitle>
            <CardDescription>
              Monitor your daily health metrics and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Daily Water Intake</span>
                <span>6/8 glasses</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Exercise Goal</span>
                <span>45/60 minutes</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Sleep Quality</span>
                <span>Good</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="pt-3 border-t">
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Log Health Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nutrition Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Nutrition & Meal Planning
          </CardTitle>
          <CardDescription>
            Powered by Nutrition API - Track meals and get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">1,847</p>
              <p className="text-sm text-gray-600">Calories Today</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">125g</p>
              <p className="text-sm text-gray-600">Protein</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">45g</p>
              <p className="text-sm text-gray-600">Fiber</p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Log Meal
            </Button>
            <Button variant="outline" className="flex-1">
              View Meal Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}