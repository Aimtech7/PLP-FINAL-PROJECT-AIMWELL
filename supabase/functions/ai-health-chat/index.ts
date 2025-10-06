import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory?: ChatMessage[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Authentication required',
        success: false
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return new Response(JSON.stringify({
        error: 'Service configuration error. Please configure OpenAI API key.',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody: RequestBody = await req.json();
    const { message, conversationHistory = [] } = requestBody;

    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'Message cannot be empty',
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (message.length > 2000) {
      return new Response(JSON.stringify({
        error: 'Message is too long. Maximum 2000 characters.',
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API...');

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

      if (response.status === 401) {
        return new Response(JSON.stringify({
          error: 'Invalid OpenAI API key. Please check your configuration.',
          success: false
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        error: 'Failed to generate response. Please try again.',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
    }), {
      status: 200,
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
