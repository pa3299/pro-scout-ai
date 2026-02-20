import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_name, club_name, language } = body;
    
    // FIX 1: Hardcoded your permanent Ngrok URL
    const N8N_URL = "https://epitomic-tory-unretreating.ngrok-free.dev/webhook/boss"; 

    // Send flat structure so n8n Boss can read it easily
    const payload = {
        query: {
            player: player_name,
            club: club_name || "",
            lang: language || "en"
        }
    };

    console.log(`🚀 Sending to n8n: ${N8N_URL}`, payload);

    // Increased Timeout (Local scraping needs >10s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 Seconds

    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' // FIX 2: The magic bypass key!
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!n8nResponse.ok) {
        throw new Error(`n8n error: ${n8nResponse.statusText}`);
    }

    const rawText = await n8nResponse.text();
    console.log("✅ Raw n8n Response:", rawText.substring(0, 100) + "..."); 

    // Smart Parsing (Handle both List and Stats)
    if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        const jsonData = JSON.parse(rawText);
        
        // CASE A: It's a Candidate List (Menu)
        if (jsonData.candidates) {
            return NextResponse.json(jsonData.candidates);
        }
        
        // CASE B: It's a Stats Report
        if (jsonData.type === 'stats' || jsonData.all_stats) {
             return NextResponse.json(jsonData);
        }

        // CASE C: Legacy/Array handling
        if (Array.isArray(jsonData)) {
            return NextResponse.json(jsonData);
        }
        
        // Fallback: Return the whole object
        return NextResponse.json(jsonData);
    }

    // Fallback for HTML/Text responses
    return new NextResponse(rawText, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error("❌ Route Error:", error);
    return NextResponse.json({ error: 'Failed to connect to Scout Engine' }, { status: 500 });
  }
}