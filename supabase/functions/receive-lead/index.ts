import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface LeadPayload {
  user_email: string;
  person_id: string;
  contact_name: string;
  position?: string;
  company?: string;
  profile_photo_url?: string;
  linkedin_url: string;
  post_content?: string;
  post_date?: string;
  ai_message: string;
  relevance_score?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('CARGO_WEBHOOK_API_KEY');

    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('Invalid or missing API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const payload: LeadPayload = await req.json();

    // Validate required fields
    if (!payload.user_email || !payload.person_id || !payload.contact_name || !payload.linkedin_url || !payload.ai_message) {
      console.error('Missing required fields:', { 
        user_email: !!payload.user_email,
        person_id: !!payload.person_id,
        contact_name: !!payload.contact_name,
        linkedin_url: !!payload.linkedin_url,
        ai_message: !!payload.ai_message
      });
      return new Response(
        JSON.stringify({ 
          error: 'Bad Request: Missing required fields',
          required: ['user_email', 'person_id', 'contact_name', 'linkedin_url', 'ai_message']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input lengths to prevent abuse
    if (payload.contact_name.length > 200 || payload.ai_message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Bad Request: Field length exceeds limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return new Response(
        JSON.stringify({ error: 'Internal error looking up user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = userData.users.find(u => u.email === payload.user_email);
    
    if (!user) {
      console.error('User not found:', payload.user_email);
      return new Response(
        JSON.stringify({ error: 'User not found with provided email' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the lead
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        person_id: payload.person_id,
        contact_name: payload.contact_name,
        position: payload.position || null,
        company: payload.company || null,
        profile_photo_url: payload.profile_photo_url || null,
        linkedin_url: payload.linkedin_url,
        post_content: payload.post_content || null,
        post_date: payload.post_date || null,
        ai_message: payload.ai_message,
        relevance_score: payload.relevance_score || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting lead:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Lead created successfully:', lead.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        message: 'Lead received and queued for review'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});