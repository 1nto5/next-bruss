import type { NextRequest } from 'next/server';
import { dbc } from '@/lib/mongo';

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ message: 'Only GET requests allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
  console.log('fetch-in-box');

  const currentTime = new Date().toISOString();

  return new Response(JSON.stringify({ message: currentTime }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
