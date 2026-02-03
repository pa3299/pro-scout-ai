import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_name, language } = body; // This stays 'language' because it comes from the frontend

    const N8N_URL = process.env.N8N_WEBHOOK_SECRET;

    if (!N8N_URL) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // --- THE CHANGE IS HERE ---
    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: { 
          player: player_name,
          lang: language   // <--- CHANGE "language" TO "lang" TO MATCH YOUR N8N PROMPT
        } 
      })
    });
    // --------------------------

    const htmlContent = await n8nResponse.text();

    return new NextResponse(htmlContent, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}