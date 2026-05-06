/**
 * SPEAK+ — Cloudflare Pages Function
 * Arquivo: functions/api/gemini.js
 * Rota automática: /api/gemini
 */

 export async function onRequest(context) {
    const env     = context.env;
    const request = context.request;
    const method  = request.method.toUpperCase();
  
    const corsHeaders = {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  
    /* preflight CORS */
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
  
    /* rejeita qualquer método que não seja POST */
    if (method !== 'POST') {
      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
        status:  405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  
    /* diagnóstico */
    console.log('[SPEAK+] /api/gemini POST recebido');
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
      const body = await request.json();
  
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