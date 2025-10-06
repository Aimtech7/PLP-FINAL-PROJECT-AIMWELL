import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(5000)
  })).max(50).optional()
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

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify JWT token
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed');
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    const requestBody = await req.json();
    const validationResult = chatRequestSchema.safeParse(requestBody);
    
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

    const { message, conversationHistory } = validationResult.data;

    console.log('Processing chat message for user:', user.id);

    // Create system prompt for health assistant
    const systemPrompt = `You are AIMWELL Assistant, an expert AI health and wellness coach. You provide evidence-based, personalized health guidance while maintaining a supportive and encouraging tone.

Your expertise includes:
- Fitness and exercise planning
- Nutrition and dietary advice
- Mental health and stress management
- Preventive healthcare
- Lifestyle optimization
- Health education

Guidelines:
- Always prioritize user safety and encourage consulting healthcare professionals for serious concerns
- Provide actionable, evidence-based advice
- Ask clarifying questions when needed for personalized recommendations
- Be encouraging and supportive while maintaining professionalism
- If asked about specific medical diagnoses or treatments, recommend consulting a healthcare provider
- Focus on holistic wellness including physical, mental, and emotional health

Keep responses concise but informative, and always consider the user's individual context when providing advice.`;

    // Prepare messages array with conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.8,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to generate response. Please try again.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully for user:', user.id);

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiResponse,
      message: 'Chat response generated successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-health-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again later.',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
