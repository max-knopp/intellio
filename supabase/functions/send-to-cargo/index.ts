import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base URL without token - token is loaded from secrets
const CARGO_API_BASE_URL = "https://api.getcargo.io/v1/models/d9493cc3-d655-4b14-88a8-113d742b59e2/records/ingest";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let leadId: string | null = null;
  let userId: string | null = null;
  let cargoPayload: Record<string, unknown> | null = null;

  try {
    const { leadId: reqLeadId, message } = await req.json();
    leadId = reqLeadId;
    
    console.log(`Processing send-to-cargo for lead: ${leadId}`);

    if (!leadId) {
      console.error("Missing leadId in request");
      return new Response(
        JSON.stringify({ error: "Missing leadId" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the lead data
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) {
      console.error("Error fetching lead:", fetchError);
      return new Response(
        JSON.stringify({ error: "Lead not found", details: fetchError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    userId = lead.user_id;
    console.log(`Found lead: ${lead.contact_name} at ${lead.company}`);

    // Prepare the payload for Cargo
    cargoPayload = {
      id: lead.id,
      person_id: lead.person_id,
      contact_name: lead.contact_name,
      position: lead.position,
      company: lead.company,
      linkedin_url: lead.linkedin_url,
      post_url: lead.post_url,
      post_content: lead.post_content,
      post_date: lead.post_date,
      ai_message: lead.ai_message,
      ai_comment: lead.ai_comment,
      relevance_score: lead.relevance_score,
      final_message: message || lead.final_message || lead.ai_message,
      sent_at: new Date().toISOString(),
    };

    console.log("Sending to Cargo API:", JSON.stringify(cargoPayload));

    // Build the URL with the token from secrets
    const cargoApiToken = Deno.env.get('CARGO_API_TOKEN');
    if (!cargoApiToken) {
      console.error("CARGO_API_TOKEN secret is not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const cargoApiUrl = `${CARGO_API_BASE_URL}?token=${cargoApiToken}`;

    // Send to Cargo API
    const cargoResponse = await fetch(cargoApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cargoPayload),
    });

    const cargoResponseText = await cargoResponse.text();
    console.log(`Cargo API response status: ${cargoResponse.status}`);
    console.log(`Cargo API response body: ${cargoResponseText}`);

    // Log the API call to the database
    const { error: logError } = await supabase
      .from('cargo_api_logs')
      .insert({
        user_id: userId,
        lead_id: leadId,
        request_payload: cargoPayload,
        response_status: cargoResponse.status,
        response_body: cargoResponseText,
        success: cargoResponse.ok,
        error_message: cargoResponse.ok ? null : cargoResponseText,
      });

    if (logError) {
      console.error("Failed to log Cargo API call:", logError);
    } else {
      console.log("Cargo API call logged successfully");
    }

    if (!cargoResponse.ok) {
      console.error("Cargo API error:", cargoResponseText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send to Cargo", 
          status: cargoResponse.status,
          details: cargoResponseText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully sent lead ${leadId} to Cargo`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lead sent to Cargo successfully",
        cargoResponse: cargoResponseText 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Unexpected error:", error);

    // Log the error to the database if we have the required info
    if (leadId && userId) {
      await supabase
        .from('cargo_api_logs')
        .insert({
          user_id: userId,
          lead_id: leadId,
          request_payload: cargoPayload || {},
          response_status: null,
          response_body: null,
          success: false,
          error_message: errorMessage,
        });
    }

    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
