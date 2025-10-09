import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  content: string;
  type: 'text' | 'video' | 'image' | 'research';
}

function generateSimpleSummary(content: string, type: string): string {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

  let summary = `# Summary\n\n`;

  if (type === 'text') {
    summary += `## Overview\n`;
    summary += `This text contains approximately ${words.length} words across ${sentences.length} sentences.\n\n`;

    summary += `## Key Points\n`;
    const firstFewSentences = sentences.slice(0, 3).join('. ');
    summary += `${firstFewSentences}...\n\n`;

    summary += `## Statistics\n`;
    summary += `- Total Words: ${words.length}\n`;
    summary += `- Total Sentences: ${sentences.length}\n`;
    summary += `- Average Words per Sentence: ${Math.round(words.length / Math.max(sentences.length, 1))}\n`;
  } else if (type === 'research') {
    summary += `## Research Topic\n`;
    summary += `Query: "${content}"\n\n`;
    summary += `## Suggested Approach\n`;
    summary += `To research this topic effectively:\n`;
    summary += `1. Define the scope and objectives\n`;
    summary += `2. Identify reliable sources\n`;
    summary += `3. Gather and analyze data\n`;
    summary += `4. Draw conclusions based on evidence\n\n`;
    summary += `## Note\n`;
    summary += `For comprehensive AI-powered research, please configure an AI provider (OpenAI, Anthropic, or Google AI).`;
  } else if (type === 'video') {
    summary += `## Video URL Analysis\n`;
    summary += `URL: ${content}\n\n`;

    if (content.includes('youtube.com') || content.includes('youtu.be')) {
      const videoId = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
      summary += `Platform: YouTube\n`;
      summary += `Video ID: ${videoId || 'Unable to extract'}\n\n`;
      summary += `## Suggested Actions\n`;
      summary += `1. Watch the video content\n`;
      summary += `2. Take notes on key points\n`;
      summary += `3. Identify main themes\n\n`;
    }
    summary += `## Note\n`;
    summary += `For AI-powered video transcription and analysis, please configure an AI provider.`;
  } else if (type === 'image') {
    summary += `## Image Analysis\n`;
    summary += `Image provided for analysis.\n\n`;
    summary += `## Note\n`;
    summary += `For AI-powered image description and analysis, please configure an AI provider with vision capabilities (OpenAI GPT-4 Vision, Google Gemini, or Anthropic Claude).`;
  }

  return summary;
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

    const requestBody: RequestBody = await req.json();
    const { content, type } = requestBody;

    if (!content || content.trim().length === 0) {
      return new Response(JSON.stringify({
        error: 'Content cannot be empty',
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${type} summarization request...`);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_KEY');

    if (!OPENAI_API_KEY && !ANTHROPIC_API_KEY && !GOOGLE_AI_KEY) {
      console.warn('No AI API keys configured. Using basic summary mode.');

      const summary = generateSimpleSummary(content, type);

      return new Response(JSON.stringify({
        success: true,
        summary: summary,
        note: 'This is a basic summary. For AI-powered analysis, configure an API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_KEY) in your Supabase Edge Functions secrets.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let messages: any[] = [];
    let apiUrl = '';
    let apiKey = '';
    let requestBody: any = {};

    if (OPENAI_API_KEY) {
      apiKey = OPENAI_API_KEY;
      apiUrl = 'https://api.openai.com/v1/chat/completions';

      if (type === 'image') {
        messages = [
          {
            role: "system",
            content: "You are an expert image analyzer. Provide detailed, accurate descriptions and summaries of images."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please provide a comprehensive analysis and summary of this image."
              },
              {
                type: "image_url",
                image_url: { url: content }
              }
            ]
          }
        ];
        requestBody = {
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 1500,
        };
      } else {
        let prompt = '';
        if (type === 'text') {
          prompt = `Please provide a comprehensive summary of the following text:\n\n${content}`;
        } else if (type === 'video') {
          prompt = `Please provide information about this video URL: ${content}`;
        } else if (type === 'research') {
          prompt = `Please provide comprehensive research and analysis on: ${content}`;
        }

        messages = [
          {
            role: "system",
            content: "You are a helpful AI assistant that provides clear, comprehensive summaries and analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ];

        requestBody = {
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 1500,
        };
      }
    } else if (ANTHROPIC_API_KEY) {
      apiKey = ANTHROPIC_API_KEY;
      apiUrl = 'https://api.anthropic.com/v1/messages';

      let userContent = '';
      if (type === 'text') {
        userContent = `Please provide a comprehensive summary of the following text:\n\n${content}`;
      } else if (type === 'research') {
        userContent = `Please provide comprehensive research and analysis on: ${content}`;
      } else {
        userContent = `Please analyze: ${content}`;
      }

      requestBody = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: userContent
          }
        ]
      };
    } else if (GOOGLE_AI_KEY) {
      apiKey = GOOGLE_AI_KEY;
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      let prompt = '';
      if (type === 'text') {
        prompt = `Please provide a comprehensive summary of the following text:\n\n${content}`;
      } else if (type === 'research') {
        prompt = `Please provide comprehensive research and analysis on: ${content}`;
      } else {
        prompt = `Please analyze: ${content}`;
      }

      requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };
    }

    console.log('Calling AI API...');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (OPENAI_API_KEY) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (ANTHROPIC_API_KEY) {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI API error:', response.status, errorData);

      const fallbackSummary = generateSimpleSummary(content, type);
      return new Response(JSON.stringify({
        success: true,
        summary: fallbackSummary,
        note: 'AI service temporarily unavailable. Showing basic summary.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let summary = '';

    if (OPENAI_API_KEY) {
      summary = data.choices[0].message.content;
    } else if (ANTHROPIC_API_KEY) {
      summary = data.content[0].text;
    } else if (GOOGLE_AI_KEY) {
      summary = data.candidates[0].content.parts[0].text;
    }

    console.log('Summary generated successfully');

    return new Response(JSON.stringify({
      success: true,
      summary: summary,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-summarize function:', error);

    try {
      const requestBody: RequestBody = await req.json();
      const fallbackSummary = generateSimpleSummary(requestBody.content, requestBody.type);

      return new Response(JSON.stringify({
        success: true,
        summary: fallbackSummary,
        note: 'An error occurred with AI processing. Showing basic summary.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({
        error: 'An unexpected error occurred',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
});
