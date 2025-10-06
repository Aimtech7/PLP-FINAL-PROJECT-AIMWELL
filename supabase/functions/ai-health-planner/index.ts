import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const plannerRequestSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  planType: z.enum(['fitness', 'nutrition', 'mental_health', 'preventive'], {
    errorMap: () => ({ message: "Invalid plan type" })
  }),
  goals: z.string().min(1).max(1000, "Goals too long"),
  currentHealth: z.string().min(1).max(1000, "Current health description too long"),
  preferences: z.string().min(1).max(1000, "Preferences too long"),
  medicalConditions: z.string().max(500).optional(),
  fitnessLevel: z.string().min(1).max(100, "Fitness level description too long")
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with anon key for RLS enforcement
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed');
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    const requestBody = await req.json();
    const validationResult = plannerRequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors);
      return new Response(JSON.stringify({ 
        error: 'Invalid request data',
        details: validationResult.error.errors.map(e => e.message)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      userId, 
      planType, 
      goals, 
      currentHealth, 
      preferences, 
      medicalConditions,
      fitnessLevel 
    } = validationResult.data;

    // Verify user is creating plan for themselves
    if (userId !== user.id) {
      console.error('User ID mismatch:', { requestedUserId: userId, authenticatedUserId: user.id });
      return new Response(JSON.stringify({ 
        error: 'Unauthorized: Cannot create plans for other users'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating health plan for user:', user.id, 'Plan type:', planType);

    // Create system prompt based on plan type
    let systemPrompt = '';
    
    switch (planType) {
      case 'fitness':
        systemPrompt = `You are an expert fitness coach and personal trainer. Create a comprehensive, personalized fitness plan that is safe, effective, and achievable. Focus on progressive training, proper form, and sustainable habits.`;
        break;
      case 'nutrition':
        systemPrompt = `You are a certified nutritionist and dietitian. Create a balanced, evidence-based nutrition plan that promotes optimal health. Consider nutritional science, dietary guidelines, and sustainable eating habits.`;
        break;
      case 'mental_health':
        systemPrompt = `You are a licensed mental health professional specializing in wellness coaching. Create a holistic mental health and wellness plan focusing on stress management, mindfulness, and emotional well-being.`;
        break;
      case 'preventive':
        systemPrompt = `You are a preventive medicine specialist and health coach. Create a comprehensive preventive health plan focusing on early detection, lifestyle modification, and health maintenance.`;
        break;
      default:
        systemPrompt = `You are a comprehensive health and wellness expert. Create a holistic health plan that addresses fitness, nutrition, mental health, and preventive care.`;
    }

    const userPrompt = `
Create a detailed, personalized ${planType} health plan with the following information:

**User Goals:** ${goals}
**Current Health Status:** ${currentHealth}
**Preferences:** ${preferences}
**Medical Conditions:** ${medicalConditions || 'None specified'}
**Fitness Level:** ${fitnessLevel}

Please provide a comprehensive plan in JSON format with the following structure:
{
  "title": "Personalized [Plan Type] Plan",
  "overview": "Brief overview of the plan",
  "duration": "Recommended plan duration",
  "goals": ["Primary goal 1", "Primary goal 2", "Primary goal 3"],
  "weekly_schedule": [
    {
      "day": "Monday",
      "activities": ["Activity 1", "Activity 2"],
      "focus": "Focus area for the day"
    }
  ],
  "nutrition_guidelines": {
    "daily_calories": "Estimated daily calorie needs",
    "macros": {
      "protein": "protein percentage",
      "carbs": "carb percentage", 
      "fats": "fat percentage"
    },
    "meal_suggestions": ["Breakfast idea", "Lunch idea", "Dinner idea", "Snack ideas"],
    "hydration": "Daily water intake recommendation"
  },
  "progress_tracking": {
    "metrics": ["Metric 1", "Metric 2", "Metric 3"],
    "frequency": "How often to track",
    "milestones": ["1 week milestone", "1 month milestone", "3 month milestone"]
  },
  "safety_considerations": ["Safety tip 1", "Safety tip 2"],
  "modifications": {
    "beginner": "Modifications for beginners",
    "advanced": "Progressions for advanced users",
    "limitations": "Modifications for any medical conditions"
  },
  "resources": ["Resource 1", "Resource 2", "Resource 3"],
  "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"]
}

Make sure the plan is evidence-based, safe, and tailored to the user's specific needs and limitations.
`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate health plan. Please try again.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response received for user:', user.id);

    // Parse the JSON response from AI
    let planContent;
    try {
      planContent = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Error parsing AI response as JSON');
      // Fallback: store as structured text if JSON parsing fails
      planContent = {
        title: `Personalized ${planType} Plan`,
        overview: "AI-generated health plan",
        content: aiResponse
      };
    }

    // Save the health plan to the database (RLS will ensure user can only insert for themselves)
    const { data: healthPlan, error: dbError } = await supabase
      .from('health_plans')
      .insert({
        user_id: userId,
        plan_type: planType,
        content: planContent,
        ai_generated: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message, dbError.code);
      return new Response(JSON.stringify({ 
        error: 'Failed to save health plan. Please try again.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Health plan saved successfully for user:', user.id);

    return new Response(JSON.stringify({ 
      success: true, 
      plan: healthPlan,
      message: 'Health plan generated successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-health-planner function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again later.',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
