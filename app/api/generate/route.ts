import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_name, language } = body;
    const N8N_URL = process.env.N8N_WEBHOOK_SECRET;

    if (!N8N_URL) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 1. Get the raw text from n8n
    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { player: player_name, lang: language } })
    });

    const rawText = await n8nResponse.text();
    const cleanText = rawText.trim();

    // 2. DECISION TIME: Does it start with '['?
    // If yes, it is a List of Players (JSON).
    if (cleanText.startsWith('[')) {
      try {
        const jsonData = JSON.parse(cleanText);
        return NextResponse.json(jsonData); // Send as Proper JSON
      } catch (e) {
        // If parsing fails, fall back to HTML
        return new NextResponse(rawText, { headers: { 'Content-Type': 'text/html' } });
      }
    } 
    
    // 3. Otherwise, it is the Scout Report (HTML)
    return new NextResponse(rawText, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}