import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const player_id = searchParams.get('player_id');

  if (!player_id) {
    return NextResponse.json({ error: 'Missing player_id' }, { status: 400 });
  }

  const TURSO_URL = "https://pro-scout-ai-p-a2003.aws-eu-west-1.turso.io";
  const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI1MzE2MTksImlkIjoiMDE5Y2IwZTUtMTkwMS03ZDJiLWIzMmQtYWZhZWVhMzY5Y2YzIiwicmlkIjoiMDM1NjY1OWQtM2IxNS00MzE4LTk5OWQtYWU1Yjg5NGVlZWEwIn0.qiryBb57c9O4L4F77sybUzN-HzCEdkZJw9erc07-TaJmww56fgP5c2FTsLKXePVr-D4gF2kd1vEIiryPnNYECg"; 

  try {
    const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            type: "execute",
            stmt: {
              sql: "SELECT DISTINCT season, competition FROM season_aggregates WHERE player_id = ? ORDER BY season DESC",
              args: [{ type: "text", value: String(player_id) }]
            }
          },
          { type: "close" }
        ]
      })
    });

    const data = await res.json();
    
    const executeResult = data.results?.[0]?.response?.result || data.batched_results?.[0]?.step_results?.[0]?.execute_result;
    
    if (!executeResult || !executeResult.rows) {
        return NextResponse.json([]);
    }

    const cols = executeResult.cols.map((c: any) => c.name);
    const mappedSeasons = executeResult.rows.map((row: any[]) => {
        const obj: any = {};
        cols.forEach((col: string, i: number) => { obj[col] = row[i]?.value !== undefined ? row[i].value : row[i]; });
        return obj;
    });

    return NextResponse.json(mappedSeasons);
  } catch (error) {
    console.error("Turso Fetch Error:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}