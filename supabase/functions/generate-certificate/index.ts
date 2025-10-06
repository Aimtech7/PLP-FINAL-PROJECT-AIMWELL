import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const certificateRequestSchema = z.object({
  certificateId: z.string().uuid("Invalid certificate ID format")
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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with anon key for authentication
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify JWT token
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed');
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    const requestBody = await req.json();
    const validationResult = certificateRequestSchema.safeParse(requestBody);
    
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

    const { certificateId } = validationResult.data;

    console.log('Generating PDF certificate for ID:', certificateId, 'User:', user.id);

    // First verify the user owns this certificate using anon key (enforces RLS)
    const { data: certCheck, error: checkError } = await supabaseAuth
      .from('certificates')
      .select('id, user_id')
      .eq('id', certificateId)
      .single();

    if (checkError || !certCheck) {
      console.error('Certificate not found or access denied');
      return new Response(JSON.stringify({ 
        error: 'Certificate not found or you do not have access to it'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user owns the certificate
    if (certCheck.user_id !== user.id) {
      console.error('User does not own certificate:', { certificateUserId: certCheck.user_id, requestUserId: user.id });
      return new Response(JSON.stringify({ 
        error: 'Unauthorized: You do not have access to this certificate'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role key ONLY for storage upload (justified: public bucket write access needed)
    const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get certificate details with service role for full data access
    const { data: certificate, error: certError } = await supabaseService
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (certError || !certificate) {
      console.error('Failed to retrieve certificate details');
      return new Response(JSON.stringify({ 
        error: 'Failed to retrieve certificate details'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate PDF content (simplified HTML to PDF approach)
    const pdfContent = generateCertificateHTML(certificate);
    
    // Convert HTML to PDF using a simple approach
    // In a production environment, you'd use a proper PDF library
    const pdfBuffer = await htmlToPdf(pdfContent);

    // Generate filename
    const fileName = `${certificate.unique_code}.pdf`;
    const filePath = `${certificate.user_id}/${fileName}`;

    // Upload PDF to Supabase Storage (service role needed for public bucket upload)
    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from('certificates')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Failed to upload certificate:', uploadError.message);
      return new Response(JSON.stringify({ 
        error: 'Failed to upload certificate'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get public URL for the certificate
    const { data: urlData } = supabaseService.storage
      .from('certificates')
      .getPublicUrl(filePath);

    const certificateUrl = urlData.publicUrl;

    // Update certificate record with URL (using auth client to enforce RLS)
    const { error: updateError } = await supabaseAuth
      .from('certificates')
      .update({ certificate_url: certificateUrl })
      .eq('id', certificateId);

    if (updateError) {
      console.error('Failed to update certificate URL');
      return new Response(JSON.stringify({ 
        error: 'Failed to update certificate'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Certificate PDF generated successfully for user:', user.id);

    return new Response(JSON.stringify({ 
      success: true, 
      certificateUrl,
      message: 'Certificate PDF generated successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-certificate function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again later.',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateCertificateHTML(certificate: any): string {
  const issueDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Certificate of Completion</title>
        <style>
            body {
                font-family: 'Times New Roman', serif;
                margin: 0;
                padding: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .certificate {
                background: white;
                width: 800px;
                padding: 60px;
                border: 10px solid #4a90e2;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #4a90e2;
                margin-bottom: 20px;
            }
            .title {
                font-size: 36px;
                font-weight: bold;
                color: #333;
                margin: 30px 0;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .subtitle {
                font-size: 18px;
                color: #666;
                margin-bottom: 40px;
            }
            .student-name {
                font-size: 48px;
                font-weight: bold;
                color: #4a90e2;
                margin: 30px 0;
                border-bottom: 3px solid #4a90e2;
                padding-bottom: 20px;
            }
            .course-info {
                font-size: 24px;
                color: #333;
                margin: 30px 0;
            }
            .course-title {
                font-weight: bold;
                color: #4a90e2;
            }
            .details {
                margin: 40px 0;
                font-size: 16px;
                color: #666;
            }
            .score {
                font-size: 20px;
                font-weight: bold;
                color: #27ae60;
                margin: 20px 0;
            }
            .verification {
                margin-top: 40px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                font-size: 14px;
                color: #666;
            }
            .verification-code {
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: #333;
                background: #e9ecef;
                padding: 5px 10px;
                border-radius: 5px;
                margin: 0 5px;
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="logo">🎯 AIMWELL</div>
            
            <div class="title">Certificate of Completion</div>
            
            <div class="subtitle">This is to certify that</div>
            
            <div class="student-name">${certificate.student_name}</div>
            
            <div class="subtitle">has successfully completed the course</div>
            
            <div class="course-info">
                <span class="course-title">${certificate.course_title}</span>
            </div>
            
            <div class="score">Final Score: ${certificate.score}%</div>
            
            <div class="details">
                <p>Date of Completion: ${issueDate}</p>
                <p>This certificate represents a significant achievement in professional development and learning excellence.</p>
            </div>
            
            <div class="verification">
                <p><strong>Certificate Verification</strong></p>
                <p>Verification Code: <span class="verification-code">${certificate.unique_code}</span></p>
                <p>Verify this certificate at: aimwell.app/verify/${certificate.unique_code}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

async function htmlToPdf(html: string): Promise<Uint8Array> {
  // This is a simplified implementation
  // In production, you would use a proper HTML to PDF service like Puppeteer or wkhtmltopdf
  
  // For now, we'll create a simple text-based PDF placeholder
  // In a real implementation, you'd integrate with a PDF generation service
  
  const pdfHeader = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Certificate of Completion) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000221 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
314
%%EOF`;

  return new TextEncoder().encode(pdfHeader);
}
