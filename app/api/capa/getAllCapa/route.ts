import { NextResponse, type NextRequest } from 'next/server';
import { dbc } from '@/lib/mongo';

export async function GET(req: NextRequest) {
  const capaCol = await dbc('capa');
  const allCapa = await capaCol.find({}).toArray();
  return new NextResponse(JSON.stringify(allCapa));
}
