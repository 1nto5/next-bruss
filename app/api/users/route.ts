import { dbc } from '@/lib/mongo';
import { extractFullNameFromEmail } from '@/lib/utils/nameFormat';
import { ObjectId } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// https://nextjs.org/docs/app/building-your-application/caching#on-demand-revalidation
// https://nextjs.org/docs/app/api-reference/functions/revalidateTag
export const dynamic = 'force-dynamic';
// 'auto' | 'force-dynamic' | 'error' | 'force-static'

export async function GET() {
  try {
    const coll = await dbc('users');
    const usersEmail = await coll
      .find({}, { projection: { email: 1 } })
      .toArray();
    const emails = usersEmail.map((user) => user.email);
    const usersList = emails.map((email) => ({
      email: email,
      name: extractFullNameFromEmail(email),
    }));
    return NextResponse.json(usersList);
  } catch (error) {
    console.error('api/users: ' + error);
    return NextResponse.json({ error: 'users api' }, { status: 503 });
  }
}
