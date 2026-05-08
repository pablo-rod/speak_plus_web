// supabase/functions/elevenlabs/index.ts
// Deploy: npx supabase functions deploy elevenlabs

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: cors })
  }

  const ELEVENLABS_KEY        = Deno.env.get('ELEVENLABS_KEY')
  const ELEVENLABS_VOICE_AIDEN = Deno.env.get('ELEVENLABS_VOICE_AIDEN') || 'pNInz6obpgDQGcFmaJgB'
  const ELEVENLABS_VOICE_AILA  = Deno.env.get('ELEVENLABS_VOICE_AILA')  || 'EXAVITQu4vr4xnSDxMaL'

  if (!ELEVENLABS_KEY) {
    return new Response(
      JSON.stringify({ error: { message: 'ELEVENLABS_KEY não configurada.' } }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body    = await req.json()
    const tutor   = body.tutor === 'aila' ? 'aila' : 'aiden'
    const voiceId = tutor === 'aila' ? ELEVENLABS_VOICE_AILA : ELEVENLABS_VOICE_AIDEN

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_KEY },
        body: JSON.stringify({
          text:           body.text,
          model_id:       'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), {
        status: res.status,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const audio = await res.arrayBuffer()
    return new Response(audio, {
      status: 200,
      headers: { ...cors, 'Content-Type': 'audio/mpeg' },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ error: { message: e.message } }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})