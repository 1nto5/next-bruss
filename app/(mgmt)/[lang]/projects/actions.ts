'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { ProjectsType } from './lib/projects-zod';

export async function revalidateProjects() {
  revalidateTag('projects');
}

export async function redirectToProjects() {
  redirect('/projects');
}

export async function insertProjectsEntry(
  data: ProjectsType,
): Promise<{ success: 'inserted' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('projects');

    const res = await coll.insertOne(data);
    if (res) {
      revalidateProjects();
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertProjectsEntry server action error' };
  }
}
