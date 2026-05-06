/**
 * SPEAK+ — Cloudflare Pages Function
 * Arquivo: functions/api/gemini.js
 * Rota automática: POST /api/gemini
 */

 export async function onRequestPost(context) {
    const env = context.env;
  
    const corsHeaders = {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  
    /* diagnóstico — aparece em Cloudflare Pages > Functions > Logs */
    console.log('[SPEAK+] /api/gemini chamado');
    console.log('[SPEAK+] GEMINI_API_KEY presente:', !!env.GEMINI_API_KEY);
  
    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({
        error: { message: 'GEMINI_API_KEY não configurada nos Secrets do Cloudflare Pages.' }
      }), {
        status:  500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  
    try {
      const body = await context.request.json();
  
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        }
      );
  
      const data = await geminiRes.json();
      console.log('[SPEAK+] Gemini status:', geminiRes.status);
  
      return new Response(JSON.stringify(data), {
        status:  geminiRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
  
    } catch (err) {
      console.error('[SPEAK+] Erro Gemini:', err.message);
      return new Response(JSON.stringify({ error: { message: err.message } }), {
        status:  500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
  
  export async function onRequestOptions() {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }