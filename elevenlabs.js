/**
 * SPEAK+ — Cloudflare Pages Function
 * Arquivo: functions/api/elevenlabs.js
 * Rota automática: /api/elevenlabs
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
  
    if (method !== 'POST') {
      return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
        status:  405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  
    console.log('[SPEAK+] /api/elevenlabs POST recebido');
    console.log('[SPEAK+] ELEVENLABS_KEY presente:', !!env.ELEVENLABS_KEY);
  
    if (!env.ELEVENLABS_KEY) {
      return new Response(JSON.stringify({
        error: { message: 'ELEVENLABS_KEY não configurada nos Secrets do Cloudflare Pages.' }
      }), {
        status:  500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  
    try {
      const body    = await request.json();
      const tutor   = body.tutor === 'aila' ? 'aila' : 'aiden';
      const voiceId = tutor === 'aila'
        ? env.ELEVENLABS_VOICE_AILA
        : env.ELEVENLABS_VOICE_AIDEN;
  
      console.log('[SPEAK+] Tutor:', tutor, '| VoiceId presente:', !!voiceId);
  
      const elRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key':   env.ELEVENLABS_KEY,
          },
          body: JSON.stringify({
            text:           body.text,
            model_id:       'eleven_multilingual_v2',
            voice_settings: {
              stability:         0.5,
              similarity_boost:  0.75,
              style:             0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );
  
      console.log('[SPEAK+] ElevenLabs status:', elRes.status);
  
      if (!elRes.ok) {
        const errText = await elRes.text();
        return new Response(JSON.stringify({ error: errText }), {
          status:  elRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
  
      const audioBuffer = await elRes.arrayBuffer();
      return new Response(audioBuffer, {
        status:  200,
        headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      });
  
    } catch (err) {
      console.error('[SPEAK+] Erro ElevenLabs:', err.message);
      return new Response(JSON.stringify({ error: { message: err.message } }), {
        status:  500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }