'use server';

import {
  ApprovalHistoryType,
  ApprovalType,
  correctiveActionType,
  DeviationType,
} from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  AddCorrectiveActionType,
  AddDeviationDraftType,
  AddDeviationType,
} from './lib/zod';
// import { redirect } from 'next/navigation';

export async function revalidateDeviations() {
  revalidateTag('deviations');
}

export async function updateCorrectiveAction(
  id: string,
  correctiveAction: AddCorrectiveActionType,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    console.log(id);
    const deviationToUpdate = await collection.findOne({
      _id: new ObjectId(id),
    });
    if (!deviationToUpdate) {
      return { error: 'not found' };
    }
    if (session.user?.email !== deviationToUpdate.owner) {
      return { error: 'not authorized' };
    }

    const status = {
      value: 'open',
      executedAt: new Date(),
      changed: {
        at: new Date(),
        by: session.user?.email,
      },
    };

    const res = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          correctiveActions: [
            ...(deviationToUpdate.correctiveActions || []),
            {
              ...correctiveAction,
              created: {
                at: new Date(),
                by: session.user?.email,
              },
              status,
            },
          ],
        },
      },
    );

    if (res) {
      revalidateTag('deviation');
      return { success: 'updated' };
    } else {
      return { error: 'not updated' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'updateCorrectiveAction server action error' };
  }
}

export async function redirectToDeviation(id: string) {
  redirect(`/deviations/${id}`);
}

export async function revalidateReasons() {
  revalidateTag('deviationReasons');
}

export async function approveDeviation(
  id: string,
  userRole: string,
  isApproved: boolean = true,
  comment?: string,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return { error: 'unauthorized' };
  }

  const approvalFieldMap: { [key: string]: keyof DeviationType } = {
    'group-leader': 'groupLeaderApproval',
    'quality-manager': 'qualityManagerApproval',
    'production-manager': 'productionManagerApproval',
    'plant-manager': 'plantManagerApproval',
  };

  // Check if user has permission to approve as the specified role
  const hasDirectRole = (session.user?.roles ?? []).includes(userRole);
  const isPlantManager = (session.user?.roles ?? []).includes('plant-manager');
  const isProductionManager = (session.user?.roles ?? []).includes(
    'production-manager',
  );

  // Role elevation rules
  const canElevateToRole =
    (isPlantManager &&
      [
        'group-leader',
        'quality-manager',
        'production-manager',
        'plant-manager',
      ].includes(userRole)) ||
    (isProductionManager && userRole === 'group-leader');

  // If user doesn't have direct role or elevated permission, reject
  if (!hasDirectRole && !canElevateToRole) {
    return { error: 'unauthorized role' };
  }

  const approvalField = approvalFieldMap[userRole];
  if (!approvalField) {
    return { error: 'invalid role' };
  }

  try {
    const coll = await dbc('deviations');
    const deviation = await coll.findOne({ _id: new ObjectId(id) });
    if (!deviation) {
      return { error: 'not found' };
    }

    // Add validation for approval/rejection rules similar to UI:
    // 1. Prevent approving if already approved
    if (isApproved && deviation[approvalField]?.approved === true) {
      return { error: 'already approved' };
    }

    // 2. Only allow rejecting if not already decided (undefined)
    if (!isApproved && deviation[approvalField]?.approved !== undefined) {
      return { error: 'cannot reject after decision has been made' };
    }

    const currentApproval = deviation[approvalField] as
      | ApprovalType
      | undefined;
    const newApprovalRecord: ApprovalType = {
      approved: isApproved,
      by: session.user?.email,
      at: new Date(),
    };

    // Add comment for both approval and rejection
    if (comment) {
      newApprovalRecord.reason = comment;
    }

    // Prepare history records
    let history: ApprovalHistoryType[] = [];

    // Add the current approval to history if it exists
    if (currentApproval) {
      // If there's already history, preserve it
      if (currentApproval.history && currentApproval.history.length > 0) {
        history = [...currentApproval.history];
      }

      // Add the current approval state as a history item (excluding its own history)
      const { history: _, ...currentApprovalWithoutHistory } = currentApproval;
      history.unshift(currentApprovalWithoutHistory as ApprovalHistoryType);
    }

    // Set the history to the approval record
    newApprovalRecord.history = history;

    const updateField: Partial<DeviationType> = {
      [approvalField]: newApprovalRecord,
    };

    // If rejection, set status to rejected
    if (!isApproved) {
      updateField.status = 'rejected';
    } else {
      // Only check for all approvals if this is an approval (not rejection)
      const hasAllApprovals = Object.values(approvalFieldMap).every((field) =>
        field === approvalField ? true : deviation[field]?.approved,
      );

      if (hasAllApprovals) {
        const now = new Date();
        const periodFrom = new Date(deviation.timePeriod.from);
        const periodTo = new Date(deviation.timePeriod.to);

        updateField.status =
          now >= periodFrom && now <= periodTo ? 'in progress' : 'approved';
      }
    }

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
    return { success: isApproved ? 'approved' : 'rejected' };
  } catch (error) {
    console.error(error);
    return { error: 'approveDeviation server action error' };
  }
}

export async function changeCorrectiveActionStatus(
  id: string,
  index: number,
  status: correctiveActionType['status'],
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return { error: 'unauthorized' };
  }
  try {
    const coll = await dbc('deviations');
    const deviation = await coll.findOne({ _id: new ObjectId(id) });
    if (!deviation) {
      return { error: 'not found' };
    }
    if (deviation.owner !== session.user?.email) {
      return { error: 'unauthorized' };
    }

    const correctiveActions = deviation.correctiveActions || [];
    if (index < 0 || index >= correctiveActions.length) {
      return { error: 'invalid index' };
    }
    const currentStatus = correctiveActions[index].status;
    const history = correctiveActions[index].history || [];

    history.unshift(currentStatus);

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          [`correctiveActions.${index}.status`]: status,
          [`correctiveActions.${index}.history`]: history,
        },
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not updated' };
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

export async function revalidateDeviation() {
  revalidateTag('deviation');
}

// Helper function to generate the next internal ID
async function generateNextInternalId(): Promise<string> {
  try {
    const collection = await dbc('deviations');
    const currentYear = new Date().getFullYear();
    const shortYear = currentYear.toString().slice(-2); // Get last two digits of year

    // Find the highest internalId for the current short year
    const latestDeviation = await collection
      .find({ internalId: { $regex: `\/+${shortYear}$` } })
      .sort({ internalId: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 1;
    if (latestDeviation.length > 0 && latestDeviation[0].internalId) {
      const latestIdParts = latestDeviation[0].internalId.split('/');
      if (latestIdParts.length === 2) {
        nextNumber = parseInt(latestIdParts[0], 10) + 1;
      }
    }

    return `${nextNumber}/${shortYear}`;
  } catch (error) {
    console.error('Failed to generate internal ID:', error);
    // Fallback to a timestamp-based ID if there's an error
    return `${Date.now()}/${new Date().getFullYear().toString().slice(-2)}`;
  }
}

// Update insertDeviation to include internalId
export async function insertDeviation(deviation: AddDeviationType) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');

    // Generate internal ID (only for non-draft deviations)
    const internalId = await generateNextInternalId();

    const deviationToInsert: DeviationType = {
      internalId,
      status: 'in approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
      ...(deviation.charge && { charge: deviation.charge }),
      reason: deviation.reason,
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      ...(deviation.area && { area: deviation.area }),
      ...(deviation.description && { description: deviation.description }),
      ...(deviation.processSpecification && {
        processSpecification: deviation.processSpecification,
      }),
      createdAt: new Date(),
      ...(deviation.customerNumber && {
        customerNumber: deviation.customerNumber,
      }),
      customerAuthorization: deviation.customerAuthorization,
      owner: session.user?.email,
      correctiveActions: [],
    };

    const res = await collection.insertOne(deviationToInsert);
    if (res) {
      revalidateTag('deviations');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertDeviation server action error' };
  }
}

export async function insertDraftDeviation(deviation: AddDeviationDraftType) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  try {
    const collection = await dbc('deviations');

    const deviationDraftToInsert: DeviationType = {
      status: 'draft',
      ...(deviation.articleName && { articleName: deviation.articleName }),
      ...(deviation.articleNumber && {
        articleNumber: deviation.articleNumber,
      }),
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
      ...(deviation.unit && { unit: deviation.unit }),
      ...(deviation.charge && { charge: deviation.charge }),
      ...(deviation.reason && { reason: deviation.reason }),
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      ...(deviation.area && { area: deviation.area }),
      ...(deviation.description && { description: deviation.description }),
      ...(deviation.processSpecification && {
        processSpecification: deviation.processSpecification,
      }),
      createdAt: new Date(),
      ...(deviation.customerNumber && {
        customerNumber: deviation.customerNumber,
      }),
      customerAuthorization: deviation.customerAuthorization,
      owner: session.user?.email,
      correctiveActions: [],
    };

    const res = await collection.insertOne(deviationDraftToInsert);
    if (res) {
      revalidateTag('deviations');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertDraftDeviation server action error' };
  }
}

export async function findArticleName(articleNumber: string) {
  try {
    const collection = await dbc('inventory_articles');
    const res = await collection.findOne({ number: articleNumber });
    if (res) {
      return { success: res.name };
    } else {
      return { error: 'not found' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'findArticleName server action error' };
  }
}

export async function deleteDraftDeviation(id: string) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const res = await collection.deleteOne({
      _id: new ObjectId(id),
      owner: session.user?.email,
      status: 'draft',
    });
    if (res) {
      revalidateTag('deviations');
      return { success: 'deleted' };
    } else {
      return { error: 'not deleted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'deleteDraftDeviation server action error' };
  }
}

export async function updateDraftDeviation(
  id: string,
  deviation: AddDeviationDraftType,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const deviationToUpdate = await collection.findOne({
      _id: new ObjectId(id),
    });
    if (!deviationToUpdate) {
      return { error: 'not found' };
    }
    if (session.user?.email !== deviationToUpdate.owner) {
      return { error: 'not authorized' };
    }
    if (deviationToUpdate.status !== 'draft') {
      return { error: 'not draft' };
    }

    const updateData: Partial<DeviationType> = {
      status: 'draft',
      ...(deviation.articleName && { articleName: deviation.articleName }),
      ...(deviation.articleNumber && {
        articleNumber: deviation.articleNumber,
      }),
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
      ...(deviation.unit && { unit: deviation.unit }),
      ...(deviation.charge && { charge: deviation.charge }),
      ...(deviation.reason && { reason: deviation.reason }),
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      ...(deviation.area && { area: deviation.area }),
      ...(deviation.description && { description: deviation.description }),
      ...(deviation.processSpecification && {
        processSpecification: deviation.processSpecification,
      }),

      customerAuthorization: deviation.customerAuthorization,
    };

    const res = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (res.matchedCount === 0) {
      return { error: 'not found' };
    }

    revalidateTag('deviations');
    return { success: 'updated' };
  } catch (error) {
    console.error(error);
    return { error: 'updateDraftDeviation server action error' };
  }
}

// Update insertDeviationFromDraft to include internalId
export async function insertDeviationFromDraft(
  id: string,
  deviation: AddDeviationType,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const draftDeviation = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!draftDeviation) {
      return { error: 'draft not found' };
    }

    if (session.user?.email !== draftDeviation.owner) {
      return { error: 'not authorized' };
    }

    if (draftDeviation.status !== 'draft') {
      return { error: 'source is not a draft' };
    }

    // Generate internal ID when converting from draft to active deviation
    const internalId = await generateNextInternalId();

    const deviationToInsert: DeviationType = {
      internalId,
      status: 'in approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
      ...(deviation.charge && { charge: deviation.charge }),
      reason: deviation.reason,
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      ...(deviation.area && { area: deviation.area }),
      ...(deviation.description && { description: deviation.description }),
      ...(deviation.processSpecification && {
        processSpecification: deviation.processSpecification,
      }),
      createdAt: new Date(),
      ...(deviation.customerNumber && {
        customerNumber: deviation.customerNumber,
      }),
      customerAuthorization: deviation.customerAuthorization,
      owner: session.user?.email,
      correctiveActions: [],
    };

    const insertRes = await collection.insertOne(deviationToInsert);
    if (!insertRes.insertedId) {
      return { error: 'failed to insert new deviation' };
    }

    // Delete the draft after successful creation of the deviation
    const deleteRes = await collection.deleteOne({ _id: new ObjectId(id) });

    revalidateDeviationsAndDeviation();
    return { success: 'inserted' };
  } catch (error) {
    console.error(error);
    return { error: 'insertDeviationFromDraft server action error' };
  }
}
