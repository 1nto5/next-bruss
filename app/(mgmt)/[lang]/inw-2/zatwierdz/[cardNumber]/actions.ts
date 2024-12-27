'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
// import { redirect } from 'next/navigation';

export async function revalidateCardPositions() {
  revalidateTag('inventory-card-positions');
}
