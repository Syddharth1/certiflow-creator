import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

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

    // Send email using Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    try {
      const emailResponse = await resend.emails.send({
        from: "Certificate System <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `Your Certificate: ${certificateTitle}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #333; margin-bottom: 20px;">Congratulations ${recipientName}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              You have received a certificate: <strong>${certificateTitle}</strong>
            </p>
            ${senderName ? `<p style="color: #666; font-size: 16px;">From: ${senderName}</p>` : ''}
            ${message ? `<p style="color: #666; font-size: 16px; font-style: italic;">"${message}"</p>` : ''}
            <div style="margin: 30px 0;">
              <img src="data:image/png;base64,${certificateData}" alt="Certificate" style="max-width: 100%; height: auto; border: 2px solid #ddd; border-radius: 8px;" />
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This certificate was sent through our secure certificate delivery system.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `${certificateTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
            content: certificateData,
          }
        ]
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          certificateId: certificate.id,
          emailId: emailResponse.data?.id,
          message: "Certificate saved and email sent successfully!"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError);
      // Still return success since certificate was saved
      return new Response(
        JSON.stringify({ 
          success: true, 
          certificateId: certificate.id,
          message: "Certificate saved successfully, but email sending failed. Please check your Resend configuration.",
          emailError: emailError.message
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

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