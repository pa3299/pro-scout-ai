import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // FIX 1: Extract club_name
    const { player_name, club_name, language } = body;
    const N8N_URL = process.env.N8N_WEBHOOK_SECRET;

    if (!N8N_URL) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // FIX 2: Send 'club' to N8N
    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          query: { 
              player: player_name, 
              club: club_name || "", // <--- THIS WAS MISSING
              lang: language 
          } 
      })
    });

    const rawText = await n8nResponse.text();
    const cleanText = rawText.trim();

    if (cleanText.startsWith('[') || cleanText.startsWith('{')) {
      try {
        const jsonData = JSON.parse(cleanText);
        const list = Array.isArray(jsonData) ? jsonData : (jsonData.candidates || []);
        return NextResponse.json(list); 
      } catch (e) {
        return new NextResponse(rawText, { headers: { 'Content-Type': 'text/html' } });
      }
    } 
    
    return new NextResponse(rawText, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}