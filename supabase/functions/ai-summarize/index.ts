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

    console.log(`Processing ${type} summarization request...`);

    let messages: any[] = [];
    let model = 'gpt-4o';

    switch (type) {
      case 'image':
        messages = [
          {
            role: "system",
            content: "You are an expert image analyzer. Provide detailed, accurate descriptions and summaries of images. Include key elements, colors, composition, text (if any), and context. Structure your response with clear sections."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please provide a comprehensive analysis and summary of this image. Include:\n1. Main Subject/Content\n2. Key Details\n3. Visual Elements (colors, composition)\n4. Any text or writing\n5. Context or purpose"
              },
              {
                type: "image_url",
                image_url: {
                  url: content
                }
              }
            ]
          }
        ];
        break;

      case 'video':
        messages = [
          {
            role: "system",
            content: "You are an expert at analyzing video URLs and providing summaries. When given a video URL (especially YouTube), extract the video ID and provide guidance about the content based on common video analysis patterns."
          },
          {
            role: "user",
            content: `Please provide a comprehensive summary and analysis for this video URL: ${content}\n\nInclude:\n1. Video platform and type\n2. Expected content based on URL\n3. How to get detailed information about this video\n4. Key considerations for video content analysis`
          }
        ];
        break;

      case 'research':
        messages = [
          {
            role: "system",
            content: "You are an expert research assistant with comprehensive knowledge across multiple domains. Provide well-researched, accurate, and detailed information on any topic. Structure your responses with:\n1. Overview/Introduction\n2. Key Points (numbered)\n3. Detailed Analysis\n4. Practical Applications/Examples\n5. Important Considerations\n6. Summary/Conclusion\n\nUse clear formatting with headers, bullet points, and emphasis where appropriate."
          },
          {
            role: "user",
            content: `Please provide comprehensive research and analysis on the following topic:\n\n${content}\n\nInclude relevant facts, current understanding, practical applications, and important considerations.`
          }
        ];
        break;

      case 'text':
      default:
        if (content.length > 10000) {
          return new Response(JSON.stringify({
            error: 'Text content is too long. Please limit to 10,000 characters.',
            success: false
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        messages = [
          {
            role: "system",
            content: "You are an expert summarization assistant. Create clear, concise, and comprehensive summaries that capture the key points and essential information. Structure your summaries with:\n1. Main Topic/Theme\n2. Key Points (bulleted)\n3. Important Details\n4. Conclusion/Takeaway"
          },
          {
            role: "user",
            content: `Please provide a comprehensive summary of the following text:\n\n${content}`
          }
        ];
        break;
    }

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
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
        error: 'Failed to generate summary. Please try again.',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

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
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred. Please try again later.',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
