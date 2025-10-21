'use server';

import { auth } from '@/lib/auth';
import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { OvertimeSubmissionType } from '../lib/zod';
import {
  generateNextInternalId,
  revalidateOvertime,
} from './utils';
import { redirectToAuth } from '@/app/[lang]/actions';

/**
 * Insert new overtime submission
 * Available to all authenticated users
 */
export async function insertOvertimeSubmission(
  data: OvertimeSubmissionType,
): Promise<{ success: 'inserted' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }
  try {
    const coll = await dbc('overtime_submissions');

    const internalId = await generateNextInternalId();

    const overtimeSubmissionToInsert = {
      internalId,
      status: 'pending',
      ...data,
      payment: data.payment ?? false,
      submittedAt: new Date(),
      submittedBy: session.user.email,
      editedAt: new Date(),
      editedBy: session.user.email,
    };

    const res = await coll.insertOne(overtimeSubmissionToInsert);
    if (res) {
      revalidateTag('overtime');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertOvertimeSubmission server action error' };
  }
}

/**
 * Update overtime submission (employee self-edit)
 * Only submitter can edit, only when status is 'pending'
 */
export async function updateOvertimeSubmission(
  id: string,
  data: OvertimeSubmissionType,
): Promise<{ success: 'updated' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }

  try {
    const coll = await dbc('overtime_submissions');

    // First check if the submission exists and user can edit it
    const submission = await coll.findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return { error: 'not found' };
    }

    // Only the submitter can edit their own submission, and only if it's pending
    if (submission.submittedBy !== session.user.email) {
      return { error: 'unauthorized' };
    }

    if (submission.status !== 'pending') {
      return { error: 'invalid status' };
    }

    // Prevent editing the payment field after submission
    const updateData = { ...data, payment: submission.payment };

    // Build edit history entry with only changed fields
    const changes: any = {};
    if (updateData.supervisor !== submission.supervisor) {
      changes.supervisor = {
        from: submission.supervisor,
        to: updateData.supervisor,
      };
    }
    if (
      new Date(updateData.date).getTime() !==
      new Date(submission.date).getTime()
    ) {
      changes.date = { from: submission.date, to: updateData.date };
    }
    if (updateData.hours !== submission.hours) {
      changes.hours = { from: submission.hours, to: updateData.hours };
    }
    if (updateData.reason !== submission.reason) {
      changes.reason = { from: submission.reason, to: updateData.reason };
    }
    if (updateData.overtimeRequest !== submission.overtimeRequest) {
      changes.overtimeRequest = {
        from: submission.overtimeRequest,
        to: updateData.overtimeRequest,
      };
    }
    if (updateData.payment !== submission.payment) {
      changes.payment = { from: submission.payment, to: updateData.payment };
    }
    const oldScheduledDayOff = submission.scheduledDayOff
      ? new Date(submission.scheduledDayOff).getTime()
      : undefined;
    const newScheduledDayOff = updateData.scheduledDayOff
      ? new Date(updateData.scheduledDayOff).getTime()
      : undefined;
    if (oldScheduledDayOff !== newScheduledDayOff) {
      changes.scheduledDayOff = {
        from: submission.scheduledDayOff,
        to: updateData.scheduledDayOff,
      };
    }

    const editHistoryEntry = {
      editedAt: new Date(),
      editedBy: session.user.email,
      changes,
    };

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          editedAt: new Date(),
          editedBy: session.user.email,
        },
        $push: {
          editHistory: editHistoryEntry,
        },
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }

    revalidateTag('overtime');
    return { success: 'updated' };
  } catch (error) {
    console.error(error);
    return { error: 'updateOvertimeSubmission server action error' };
  }
}

/**
 * Edit overtime submission (HR/Admin)
 * HR/Admin can edit in any status, resets to 'pending' for re-approval
 */
export async function editOvertimeSubmission(
  id: string,
  data: OvertimeSubmissionType,
): Promise<{ success: 'updated' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }

  // Only HR or admin can use this function
  const userRoles = session.user?.roles ?? [];
  const isHR = userRoles.includes('hr');
  const isAdmin = userRoles.includes('admin');

  if (!isHR && !isAdmin) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('overtime_submissions');

    // Check if the submission exists
    const submission = await coll.findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return { error: 'not found' };
    }

    // HR/Admin can edit submissions in any status

    // Build edit history entry with only changed fields
    const changes: any = {};
    if (data.supervisor !== submission.supervisor) {
      changes.supervisor = { from: submission.supervisor, to: data.supervisor };
    }
    if (
      new Date(data.date).getTime() !== new Date(submission.date).getTime()
    ) {
      changes.date = { from: submission.date, to: data.date };
    }
    if (data.hours !== submission.hours) {
      changes.hours = { from: submission.hours, to: data.hours };
    }
    if (data.reason !== submission.reason) {
      changes.reason = { from: submission.reason, to: data.reason };
    }
    if (data.overtimeRequest !== submission.overtimeRequest) {
      changes.overtimeRequest = {
        from: submission.overtimeRequest,
        to: data.overtimeRequest,
      };
    }
    if (data.payment !== submission.payment) {
      changes.payment = { from: submission.payment, to: data.payment };
    }
    const oldScheduledDayOff = submission.scheduledDayOff
      ? new Date(submission.scheduledDayOff).getTime()
      : undefined;
    const newScheduledDayOff = data.scheduledDayOff
      ? new Date(data.scheduledDayOff).getTime()
      : undefined;
    if (oldScheduledDayOff !== newScheduledDayOff) {
      changes.scheduledDayOff = {
        from: submission.scheduledDayOff,
        to: data.scheduledDayOff,
      };
    }
    // Track status change to pending
    if (submission.status !== 'pending') {
      changes.status = { from: submission.status, to: 'pending' };
    }

    const editHistoryEntry = {
      editedAt: new Date(),
      editedBy: session.user.email,
      changes,
    };

    // Update submission and reset status to pending for re-approval
    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          status: 'pending',
          editedAt: new Date(),
          editedBy: session.user.email,
        },
        $unset: {
          approvedAt: '',
          approvedBy: '',
          plantManagerApprovedAt: '',
          plantManagerApprovedBy: '',
          supervisorApprovedAt: '',
          supervisorApprovedBy: '',
          rejectedAt: '',
          rejectedBy: '',
          rejectionReason: '',
        },
        $push: {
          editHistory: editHistoryEntry,
        },
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }

    revalidateTag('overtime');
    return { success: 'updated' };
  } catch (error) {
    console.error(error);
    return { error: 'editOvertimeSubmission server action error' };
  }
}

/**
 * Cancel overtime request
 * Only submitter can cancel, only when status is 'pending'
 */
export async function cancelOvertimeRequest(id: string) {
  // Log the cancellation attempt for debugging purposes
  console.log('cancelOvertimeRequest', id);
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }

  try {
    const coll = await dbc('overtime_submissions');

    // Check if the submission exists and get its details
    const submission = await coll.findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return { error: 'not found' };
    }

    // Only the submitter can cancel their own submission, and only if it's still pending
    if (submission.submittedBy !== session.user.email) {
      return { error: 'unauthorized' };
    }

    if (submission.status !== 'pending') {
      return { error: 'cannot cancel' };
    }

    // Mark the submission as canceled instead of deleting it
    const updateResult = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: session.user.email,
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );

    if (updateResult.matchedCount === 0) {
      return { error: 'not found' };
    }

    revalidateOvertime();
    return { success: 'cancelled' };
  } catch (error) {
    console.error(error);
    return { error: 'cancelOvertimeRequest server action error' };
  }
}
