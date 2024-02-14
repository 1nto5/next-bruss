import type { NextRequest } from 'next/server';
import { dbc } from '@/lib/mongo';

type RequestBody = {
  articleId: string;
};

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: 'Only POST requests allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(JSON.stringify({ message: 'test messege' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}
