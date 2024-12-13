'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
// import { redirect } from 'next/navigation';

export async function revalidateCards() {
  revalidateTag('inventory-cards');
}

export async function revalidatePositions() {
  revalidateTag('inventory-positions');
}

export async function revalidateAll() {
  revalidateTag('inventory-cards');
  revalidateTag('inventory-positions');
}
