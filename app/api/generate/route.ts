import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_name } = body;

    // We will set this secret URL in Vercel later
    const N8N_URL = process.env.N8N_WEBHOOK_SECRET;

    if (!N8N_URL) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Send the data to your n8n workflow
    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: { player: player_name } 
      })
    });

    const htmlContent = await n8nResponse.text();

    return new NextResponse(htmlContent, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}