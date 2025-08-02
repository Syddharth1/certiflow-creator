import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCertificateRequest {
  recipientEmail: string;
  recipientName: string;
  certificateTitle: string;
  certificateData: string; // Base64 image data
  senderName?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { 
      recipientEmail, 
      recipientName, 
      certificateTitle, 
      certificateData,
      senderName,
      message 
    }: SendCertificateRequest = await req.json();

    // Save certificate to database
    const { data: certificate, error: saveError } = await supabase
      .from("certificates")
      .insert({
        user_id: user.id,
        title: certificateTitle,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        certificate_data: { imageData: certificateData },
        certificate_url: certificateData // Store the image data
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save certificate: ${saveError.message}`);
    }

    console.log("Certificate saved successfully:", certificate.id);

    // For now, we'll return success without actually sending email
    // The user will need to configure Resend API key for email functionality
    return new Response(
      JSON.stringify({ 
        success: true, 
        certificateId: certificate.id,
        message: "Certificate saved successfully. To enable email sending, please configure your Resend API key in Supabase secrets."
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-certificate function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);