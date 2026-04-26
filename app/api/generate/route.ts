import { NextResponse } from 'next/server';

// Unlock Next.js / Vercel serverless timeouts (up to 300s if on Pro, or max allowed on Hobby)
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { player_name, club_name, language, season_id, tournament_id, campaign_name, report_type } = body;
    
    // 🎯 POINT DIRECTLY TO THE BOSS WEBHOOK
    const N8N_URL = "http://159.223.214.153:5678/webhook/boss"; 

    // Send flat structure so n8n Boss's Turso Interceptor can read it perfectly
    const payload = {
        query: {
            player: player_name, // The UI now safely sends the numeric ID here!
            club: club_name || "",
            lang: language || "en",
            season_id: season_id || "",
            tournament_id: tournament_id || "",
            campaign_name: campaign_name || "Latest Campaign",
            report_type: report_type || "player"
        }
    };

    console.log(`🚀 Sending to n8n BOSS: ${N8N_URL}`, payload);

    // ⏳ THE FIX: Increased Timeout to 120,000ms (120 Seconds) 
    // This gives Turso and Gemini plenty of time to calculate the 40-player Euclidean math
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); 

    const n8nResponse = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' 
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!n8nResponse.ok) {
        throw new Error(`n8n error: ${n8nResponse.statusText}`);
    }

    // The Boss returns the beautiful HTML report
    const htmlResponse = await n8nResponse.text();
    console.log("✅ Boss Report Generated Successfully"); 

    return new NextResponse(htmlResponse, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error("❌ Generate Route Error:", error);
    return new NextResponse("Failed to generate report", { status: 500 });
  }
}