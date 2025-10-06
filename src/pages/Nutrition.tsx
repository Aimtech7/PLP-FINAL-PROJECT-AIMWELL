import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Apple, Utensils, Salad, Coffee, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NutritionPlan {
  id: string;
  plan_type: string;
  content: any;
  ai_generated: boolean;
  created_at: string;
}

const Nutrition = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  
  // Form state
  const [planType, setPlanType] = useState('');
  const [goals, setGoals] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [preferences, setPreferences] = useState('');
  const [allergies, setAllergies] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  useEffect(() => {
    fetchNutritionPlans();
  }, [user]);

  const fetchNutritionPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('health_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_type', 'nutrition')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNutritionPlans(data || []);
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      toast({
        title: "Error",
        description: "Failed to load nutrition plans.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNutritionPlan = async () => {
    if (!user || !goals) {
      toast({
        title: "Missing Information",
        description: "Please describe your nutrition goals.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-health-planner', {
        body: {
          userId: user.id,
          planType: 'nutrition',
          goals,
          currentHealth: `Activity Level: ${activityLevel}`,
          preferences: `${preferences}\nDietary Restrictions: ${dietaryRestrictions}\nAllergies: ${allergies}`,
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: "Your personalized nutrition plan has been generated!",
        });
        setShowPlanForm(false);
        fetchNutritionPlans();
        // Reset form
        setGoals('');
        setDietaryRestrictions('');
        setPreferences('');
        setAllergies('');
        setActivityLevel('');
      } else {
        throw new Error(data.error || 'Failed to generate nutrition plan');
      }
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate nutrition plan.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
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
        <h1 className="text-3xl font-bold mb-2">Nutrition Hub</h1>
        <p className="text-primary-foreground/90">
          AI-powered personalized nutrition plans tailored to your dietary needs and health goals.
        </p>
      </div>

      {/* Quick Nutrition Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base">Eat the Rainbow</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Include a variety of colorful fruits and vegetables in your daily diet for optimal nutrition.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">Balanced Meals</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aim for a balance of protein, healthy fats, and complex carbohydrates at each meal.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base">Stay Hydrated</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Drink at least 8 glasses of water daily to support digestion and overall health.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => setShowPlanForm(true)}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generate AI Nutrition Plan
        </Button>
      </div>

      {/* Plan Generation Form */}
      {showPlanForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create Your Personalized Nutrition Plan
            </CardTitle>
            <CardDescription>
              Share your dietary goals and preferences for a customized nutrition plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                  <SelectItem value="light">Lightly Active (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                  <SelectItem value="very">Very Active (6-7 days/week)</SelectItem>
                  <SelectItem value="extra">Extra Active (physical job + exercise)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Nutrition Goals *</Label>
              <Textarea
                id="goals"
                placeholder="e.g., Weight loss, muscle gain, improve energy, manage diabetes..."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietaryRestrictions"
                placeholder="e.g., Vegetarian, vegan, gluten-free, dairy-free, halal, kosher..."
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Food Allergies</Label>
              <Textarea
                id="allergies"
                placeholder="e.g., Nuts, shellfish, eggs, soy..."
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferences">Food Preferences & Lifestyle</Label>
              <Textarea
                id="preferences"
                placeholder="Favorite foods, meal timing preferences, cooking time constraints, budget..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateNutritionPlan}
                disabled={generating || !goals}
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

      {/* Nutrition Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Nutrition Plans</h2>
        {nutritionPlans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Salad className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Nutrition Plans Yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate your first AI-powered personalized nutrition plan to start eating healthier.
              </p>
              <Button onClick={() => setShowPlanForm(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {nutritionPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Apple className="h-5 w-5" />
                      <CardTitle className="text-lg">
                        {plan.content?.title || 'Nutrition Plan'}
                      </CardTitle>
                    </div>
                    {plan.ai_generated && (
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {plan.content?.overview || 'Personalized nutrition plan'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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

                  <Button variant="outline" className="w-full">
                    View Full Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Nutrition;
