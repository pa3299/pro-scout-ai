import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await fetch('http://159.223.214.153:5678/webhook/worker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { player: body.player_name, club: body.club_name, language: body.language } })
    });
    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}