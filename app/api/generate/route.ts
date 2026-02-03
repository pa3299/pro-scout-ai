import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_name, language } = body;

    // Use the secret key you added in Vercel
    const N8N_URL = process.env.N8N_WEBHOOK_SECRET;

    if (!N8N_URL) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Call n8n
    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: { 
          player: player_name,
          lang: language
        } 
      })
    });

    // --- THE FIX IS HERE ---
    // Check what n8n sent us. Is it a list (JSON) or a report (HTML)?
    const contentType = n8nResponse.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // It's a list! Send it as JSON so the app shows buttons.
      const data = await n8nResponse.json();
      return NextResponse.json(data);
    } else {
      // It's a report! Send it as HTML so the app opens the popup.
      const html = await n8nResponse.text();
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    // -----------------------

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}