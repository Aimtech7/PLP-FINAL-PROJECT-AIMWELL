import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type } = await req.json();

    if (!content) {
      throw new Error("No content provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("[AI-SUMMARIZE] Processing request - Type:", type);

    // Prepare the message based on content type
    let messages: any[] = [];

    if (type === "image") {
      // For images, send as vision input
      messages = [
        {
          role: "system",
          content: "You are a helpful AI assistant that provides concise, accurate summaries of images. Describe what you see in detail, including key elements, people, objects, text, and context."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please provide a detailed summary of this image."
            },
            {
              type: "image_url",
              image_url: {
                url: content // content should be a base64 data URL or regular URL
              }
            }
          ]
        }
      ];
    } else {
      // For text/video URL
      const prompt = type === "video" 
        ? `Please provide a comprehensive summary of the video at this URL: ${content}\n\nIf you cannot access the video directly, provide guidance on how to summarize video content.`
        : `Please provide a concise and comprehensive summary of the following text:\n\n${content}`;

      messages = [
        {
          role: "system",
          content: "You are a helpful AI assistant that provides clear, concise summaries. Focus on the main points and key takeaways."
        },
        {
          role: "user",
          content: prompt
        }
      ];
    }

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI-SUMMARIZE] API Error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    console.log("[AI-SUMMARIZE] Summary generated successfully");

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[AI-SUMMARIZE] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
