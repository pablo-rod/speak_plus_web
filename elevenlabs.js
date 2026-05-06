/**
 * SPEAK+ — Cloudflare Pages Function
 * Arquivo: functions/api/elevenlabs.js
 * Rota automática: POST /api/elevenlabs
 *
 * Os Secrets são configurados em:
 * Cloudflare Dashboard → seu projeto Pages → Settings → Environment Variables
 */

 export async function onRequestPost(context) {
    const env = context.env;
  
    const corsHeaders = {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  
    try {
      const body    = await context.request.json();
      const tutor   = body.tutor === 'aila' ? 'aila' : 'aiden';
      const voiceId = tutor === 'aila'
        ? env.ELEVENLABS_VOICE_AILA
        : env.ELEVENLABS_VOICE_AIDEN;
  
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