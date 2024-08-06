'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { ApprovalType, DeviationType } from '@/lib/types/deviation';
import { AddDeviationType } from '@/lib/z/deviation';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function approveDeviation(id: string, userRole: string) {
  const session = await auth();
  if (
    !session ||
    !session.user.email ||
    !(session.user.roles ?? []).includes(userRole)
  ) {
    return { error: 'unauthorized' };
  }

  const approvalFieldMap: { [key: string]: keyof DeviationType } = {
    'group-leader': 'groupLeaderApproval',
    'quality-manager': 'qualityManagerApproval',
    'engineering-manager': 'engineeringManagerApproval',
    'maintenance-manager': 'maintenanceManagerApproval',
    'production-manager': 'productionManagerApproval',
  };

  const approvalField = approvalFieldMap[userRole];
  if (!approvalField) {
    return { error: 'invalid role' };
  }

  const updateField: Partial<DeviationType> = {
    [approvalField]: {
      approved: true,
      by: session.user.email,
      at: new Date(),
    } as ApprovalType,
  };

  try {
    const coll = await dbc('deviations');
    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateField,
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }
    revalidateDeviationsAndDeviation();
    return { success: 'approved' };
  } catch (error) {
    console.error(error);
    return { error: 'approveDeviation server action error' };
  }
}

export async function confirmCorrectiveActionExecution(
  id: string,
  correctiveActionIndex: number,
) {
  const session = await auth();
  if (!session || !session.user.email) {
    return { error: 'unauthorized' };
  }
  try {
    const coll = await dbc('deviations');
    const deviation = await coll.findOne({ _id: new ObjectId(id) });
    if (!deviation) {
      return { error: 'not found' };
    }
    if (deviation.owner !== session.user.email) {
      return { error: 'unauthorized' };
    }

    const correctiveActions = deviation.correctiveActions || [];
    if (
      correctiveActionIndex < 0 ||
      correctiveActionIndex >= correctiveActions.length
    ) {
      return { error: 'invalid index' };
    }

    correctiveActions[correctiveActionIndex].executedAt = new Date();

    const updateField: Partial<DeviationType> = {
      correctiveActions,
    };

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateField,
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }

    revalidateDeviationsAndDeviation();
    return { success: 'updated' };
  } catch (error) {
    console.error(error);
    return { error: 'confirmCorrectiveActionExecution server action error' };
  }
}

export async function redirectToDeviations() {
  redirect('/deviations');
}

export async function revalidateDeviationsAndDeviation() {
  revalidateTag('deviation');
  revalidateTag('deviations');
}
