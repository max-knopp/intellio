import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch leads that are pending, interested, or converted (not sent, commented, or rejected)
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, post_date, created_at')
      .in('status', ['pending', 'interested', 'converted']);

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let hotCount = 0;
    let warmCount = 0;

    for (const lead of leads || []) {
      const dateStr = lead.post_date || lead.created_at;
      const date = new Date(dateStr);
      
      if (date >= sevenDaysAgo) {
        hotCount++;
      } else if (date >= thirtyDaysAgo) {
        warmCount++;
      }
      // Cold leads (older than 30 days) are not counted
    }

    const payload = {
      hot_leads: hotCount,
      warm_leads: warmCount,
      total_actionable: hotCount + warmCount,
      timestamp: now.toISOString()
    };

    console.log('Sending daily summary to webhook:', payload);

    const makeApiKey = Deno.env.get('MAKE_API_KEY');
    if (!makeApiKey) {
      throw new Error('MAKE_API_KEY not configured');
    }

    // Send to Make.com webhook
    const webhookResponse = await fetch('https://hook.eu2.make.com/wutdugy5w87ronm435p1mx2upjajqs33', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-make-apikey': makeApiKey,
      },
      body: JSON.stringify(payload),
    });

    const webhookStatus = webhookResponse.status;
    console.log('Webhook response status:', webhookStatus);

    return new Response(JSON.stringify({
      success: true,
      ...payload,
      webhook_status: webhookStatus
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in daily-lead-summary:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
