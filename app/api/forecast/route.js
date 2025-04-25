import { getPrediction } from '@/lib/forecast';

export async function GET() {
  try {
    const data = await getPrediction();
    return Response.json({ data });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch prediction' }), { status: 500 });
  }
}

