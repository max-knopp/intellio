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
  post_url?: string;
  post_content?: string;
  post_date?: string;
  ai_message: string;
  ai_comment?: string;
  relevance_score?: number;
}

// Validation helpers
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function isValidLinkedInUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('linkedin.com');
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function isValidPersonId(personId: string): boolean {
  // Allow alphanumeric, underscores, hyphens, max 100 chars
  return /^[a-zA-Z0-9_-]{1,100}$/.test(personId);
}

function sanitizeText(text: string): string {
  // Strip HTML tags to prevent XSS
  return text.replace(/<[^>]*>/g, '').trim();
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

    // Validate email format
    if (!isValidEmail(payload.user_email)) {
      console.error('Invalid email format');
      return new Response(
        JSON.stringify({ error: 'Bad Request: Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate person_id format
    if (!isValidPersonId(payload.person_id)) {
      console.error('Invalid person_id format');
      return new Response(
        JSON.stringify({ error: 'Bad Request: Invalid person_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate LinkedIn URL
    if (!isValidLinkedInUrl(payload.linkedin_url)) {
      console.error('Invalid LinkedIn URL');
      return new Response(
        JSON.stringify({ error: 'Bad Request: Invalid LinkedIn URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate optional URLs
    if (payload.post_url && !isValidUrl(payload.post_url)) {
      console.error('Invalid post URL');
      return new Response(
        JSON.stringify({ error: 'Bad Request: Invalid post URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payload.profile_photo_url && !isValidUrl(payload.profile_photo_url)) {
      console.error('Invalid profile photo URL');
      return new Response(
        JSON.stringify({ error: 'Bad Request: Invalid profile photo URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input lengths to prevent abuse
    const lengthLimits = {
      contact_name: { value: payload.contact_name, max: 200 },
      ai_message: { value: payload.ai_message, max: 5000 },
      position: { value: payload.position, max: 200 },
      company: { value: payload.company, max: 200 },
      post_content: { value: payload.post_content, max: 10000 },
      ai_comment: { value: payload.ai_comment, max: 5000 },
    };

    for (const [field, config] of Object.entries(lengthLimits)) {
      if (config.value && config.value.length > config.max) {
        console.error(`Field ${field} exceeds max length of ${config.max}`);
        return new Response(
          JSON.stringify({ error: `Bad Request: ${field} exceeds maximum length` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Sanitize text fields
    const sanitizedPayload = {
      ...payload,
      contact_name: sanitizeText(payload.contact_name),
      position: payload.position ? sanitizeText(payload.position) : null,
      company: payload.company ? sanitizeText(payload.company) : null,
      post_content: payload.post_content ? sanitizeText(payload.post_content) : null,
      ai_message: sanitizeText(payload.ai_message),
      ai_comment: payload.ai_comment ? sanitizeText(payload.ai_comment) : null,
    };

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

    // Insert the lead with sanitized data
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        person_id: sanitizedPayload.person_id,
        contact_name: sanitizedPayload.contact_name,
        position: sanitizedPayload.position,
        company: sanitizedPayload.company,
        profile_photo_url: sanitizedPayload.profile_photo_url || null,
        linkedin_url: sanitizedPayload.linkedin_url,
        post_url: sanitizedPayload.post_url || null,
        post_content: sanitizedPayload.post_content,
        post_date: sanitizedPayload.post_date || null,
        ai_message: sanitizedPayload.ai_message,
        ai_comment: sanitizedPayload.ai_comment,
        relevance_score: sanitizedPayload.relevance_score || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting lead:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead' }),
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