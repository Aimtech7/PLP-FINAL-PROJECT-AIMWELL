import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Plus, Brain, Activity, Apple, Shield, Loader2, Sparkles, Pill, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HealthPlan {
  id: string;
  plan_type: string;
  content: any;
  ai_generated: boolean;
  created_at: string;
}

const Health = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  
  // Prescription AI state
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [generatingPrescription, setGeneratingPrescription] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [existingConditions, setExistingConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [prescription, setPrescription] = useState<any>(null);
  
  // Form state
  const [planType, setPlanType] = useState('');
  const [goals, setGoals] = useState('');
  const [currentHealth, setCurrentHealth] = useState('');
  const [preferences, setPreferences] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');

  useEffect(() => {
    fetchHealthPlans();
  }, [user]);

  const fetchHealthPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('health_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHealthPlans(data || []);
    } catch (error) {
      console.error('Error fetching health plans:', error);
      toast({
        title: "Error",
        description: "Failed to load health plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateHealthPlan = async () => {
    if (!user || !planType || !goals) {
      toast({
        title: "Missing Information",
        description: "Please fill in the plan type and goals.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-planner', {
        body: {
          userId: user.id,
          planType,
          goals,
          currentHealth,
          preferences,
          medicalConditions,
          fitnessLevel
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: "Your personalized health plan has been generated!",
        });
        setShowPlanForm(false);
        fetchHealthPlans();
        // Reset form
        setPlanType('');
        setGoals('');
        setCurrentHealth('');
        setPreferences('');
        setMedicalConditions('');
        setFitnessLevel('');
      } else {
        throw new Error(data.error || 'Failed to generate health plan');
      }
    } catch (error) {
      console.error('Error generating health plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate health plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generatePrescription = async () => {
    if (!symptoms) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingPrescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-chat', {
        body: {
          message: `Based on the following symptoms and medical history, provide a detailed health recommendation including possible over-the-counter remedies, lifestyle changes, and when to see a doctor. DO NOT prescribe prescription medications.
          
Symptoms: ${symptoms}
Duration: ${duration || 'Not specified'}
Severity: ${severity || 'Not specified'}
Existing Conditions: ${existingConditions || 'None'}
Current Medications: ${currentMedications || 'None'}

Please provide:
1. Possible causes (not a diagnosis)
2. Recommended over-the-counter treatments
3. Home remedies and lifestyle changes
4. Warning signs that require immediate medical attention
5. When to consult a healthcare provider

Remember: This is informational only and not a substitute for professional medical advice.`,
          conversationHistory: []
        }
      });

      if (error) throw error;

      setPrescription({
        recommendations: data.response,
        timestamp: new Date().toISOString(),
        symptoms,
        severity
      });
      
      toast({
        title: "Recommendations Generated",
        description: "Please review the health recommendations below.",
      });
    } catch (error) {
      console.error('Error generating prescription:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPrescription(false);
    }
  };

  const getPlanTypeIcon = (type: string) => {
    switch (type) {
      case 'fitness': return <Activity className="h-5 w-5" />;
      case 'nutrition': return <Apple className="h-5 w-5" />;
      case 'mental_health': return <Brain className="h-5 w-5" />;
      case 'preventive': return <Shield className="h-5 w-5" />;
      default: return <Heart className="h-5 w-5" />;
    }
  };

  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'fitness': return 'bg-blue-100 text-blue-800';
      case 'nutrition': return 'bg-green-100 text-green-800';
      case 'mental_health': return 'bg-purple-100 text-purple-800';
      case 'preventive': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Health Hub</h1>
        <p className="text-primary-foreground/90">
          AI-powered personalized health plans and prescription guidance designed for your unique needs.
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">Health Plans</TabsTrigger>
          <TabsTrigger value="prescription">
            <Pill className="h-4 w-4 mr-2" />
            Prescription AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => setShowPlanForm(true)}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate AI Health Plan
            </Button>
          </div>

      {/* Plan Generation Form */}
      {showPlanForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create Your Personalized Health Plan
            </CardTitle>
            <CardDescription>
              Tell us about your goals and current situation to get a customized health plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type</Label>
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fitness">Fitness & Exercise</SelectItem>
                    <SelectItem value="nutrition">Nutrition & Diet</SelectItem>
                    <SelectItem value="mental_health">Mental Health & Wellness</SelectItem>
                    <SelectItem value="preventive">Preventive Health</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessLevel">Fitness Level</Label>
                <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fitness level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="athlete">Athlete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Health Goals *</Label>
              <Textarea
                id="goals"
                placeholder="Describe your health and fitness goals..."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentHealth">Current Health Status</Label>
              <Textarea
                id="currentHealth"
                placeholder="Describe your current health, fitness level, and any concerns..."
                value={currentHealth}
                onChange={(e) => setCurrentHealth(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferences">Preferences & Lifestyle</Label>
              <Textarea
                id="preferences"
                placeholder="Dietary preferences, exercise preferences, schedule constraints, etc..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
              <Textarea
                id="medicalConditions"
                placeholder="Any medical conditions, allergies, or limitations to consider..."
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateHealthPlan}
                disabled={generating || !planType || !goals}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Plan
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPlanForm(false)}
                disabled={generating}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Health Plans</h2>
        {healthPlans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Health Plans Yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate your first AI-powered personalized health plan to get started.
              </p>
              <Button onClick={() => setShowPlanForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {healthPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getPlanTypeIcon(plan.plan_type)}
                      <CardTitle className="text-lg">
                        {plan.content?.title || `${plan.plan_type} Plan`}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant="secondary" 
                        className={getPlanTypeColor(plan.plan_type)}
                      >
                        {plan.plan_type.replace('_', ' ')}
                      </Badge>
                      {plan.ai_generated && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Generated
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {plan.content?.overview || 'Personalized health plan'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    {plan.content?.duration && (
                      <div>
                        <span className="font-semibold">Duration: </span>
                        {plan.content.duration}
                      </div>
                    )}
                    
                    {plan.content?.goals && (
                      <div>
                        <span className="font-semibold">Goals:</span>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {plan.content.goals.slice(0, 3).map((goal: string, index: number) => (
                            <li key={index}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(plan.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      View Full Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
        </TabsContent>

        <TabsContent value="prescription" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Medical Disclaimer:</strong> This AI tool provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
            </AlertDescription>
          </Alert>

          {!showPrescriptionForm && !prescription && (
            <Card>
              <CardContent className="p-6 text-center">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Health Recommendations</h3>
                <p className="text-muted-foreground mb-4">
                  Get AI-powered health recommendations based on your symptoms. Not a replacement for professional medical care.
                </p>
                <Button onClick={() => setShowPrescriptionForm(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Health Recommendations
                </Button>
              </CardContent>
            </Card>
          )}

          {showPrescriptionForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Describe Your Symptoms
                </CardTitle>
                <CardDescription>
                  Provide details about your symptoms for personalized health recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms *</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe your symptoms in detail (e.g., headache, fever, cough, fatigue...)"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 3 days, 1 week"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="existingConditions">Existing Medical Conditions</Label>
                  <Textarea
                    id="existingConditions"
                    placeholder="Any chronic conditions, allergies, or recent illnesses..."
                    value={existingConditions}
                    onChange={(e) => setExistingConditions(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMedications">Current Medications</Label>
                  <Textarea
                    id="currentMedications"
                    placeholder="List any medications you're currently taking..."
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={generatePrescription}
                    disabled={generatingPrescription || !symptoms}
                  >
                    {generatingPrescription ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Recommendations
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowPrescriptionForm(false);
                      setSymptoms('');
                      setDuration('');
                      setSeverity('');
                      setExistingConditions('');
                      setCurrentMedications('');
                    }}
                    disabled={generatingPrescription}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {prescription && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Health Recommendations
                    </CardTitle>
                    <CardDescription>
                      Generated on {new Date(prescription.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setPrescription(null);
                      setShowPrescriptionForm(true);
                    }}
                  >
                    New Consultation
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    These are general recommendations based on your symptoms. Please consult a healthcare professional for proper diagnosis and treatment.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Reported Symptoms:</h4>
                    <p className="text-sm text-muted-foreground">{prescription.symptoms}</p>
                  </div>

                  {prescription.severity && (
                    <div>
                      <h4 className="font-semibold mb-1">Severity:</h4>
                      <Badge variant={
                        prescription.severity === 'severe' ? 'destructive' : 
                        prescription.severity === 'moderate' ? 'default' : 
                        'secondary'
                      }>
                        {prescription.severity}
                      </Badge>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <h4 className="font-semibold mb-2">AI Recommendations:</h4>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm">
                        {prescription.recommendations}
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Important:</strong> If symptoms worsen or you experience severe pain, difficulty breathing, chest pain, or other emergency symptoms, seek immediate medical attention.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Health;