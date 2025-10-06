import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({
        valid: false,
        message: "Service configuration error"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key
    // Note: Service role is justified here because this is a public verification endpoint
    // that needs to read certificate data without user authentication
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Extract unique_code from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const uniqueCode = pathParts[pathParts.length - 1];

    // Validate unique_code format (should be a UUID string)
    const codeValidation = z.string().uuid().safeParse(uniqueCode);
    
    if (!uniqueCode || !codeValidation.success) {
      return new Response(JSON.stringify({
        valid: false,
        message: "Invalid certificate code format"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Verifying certificate with code:', uniqueCode);

    // Look up the certificate by unique_code
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        *,
        profiles!certificates_user_id_fkey (
          first_name,
          last_name,
          full_name
        ),
        courses!certificates_course_id_fkey (
          title
        )
      `)
      .eq('unique_code', uniqueCode)
      .single();

    if (error || !certificate) {
      console.log('Certificate not found');
      return new Response(JSON.stringify({
        valid: false,
        message: "Certificate not found or invalid"
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark certificate as verified if not already
    if (!certificate.verified) {
      const { error: updateError } = await supabase
        .from('certificates')
        .update({ verified: true, verified_at: new Date().toISOString() })
        .eq('unique_code', uniqueCode);

      if (updateError) {
        console.error('Error updating verification status');
      }
    }

    // Format the response
    const studentName = certificate.student_name || 
                       certificate.profiles?.full_name || 
                       `${certificate.profiles?.first_name || ''} ${certificate.profiles?.last_name || ''}`.trim() ||
                       'Student';

    const response = {
      valid: true,
      student_name: studentName,
      course: certificate.course_title || certificate.courses?.title || 'Unknown Course',
      issued_at: new Date(certificate.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      score: certificate.score,
      certificate_url: certificate.certificate_url || null,
      verification_date: new Date().toISOString(),
      verified: true
    };

    console.log('Certificate verification successful');

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-certificate function:', error);
    return new Response(JSON.stringify({
      valid: false,
      message: "An error occurred while verifying the certificate"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
