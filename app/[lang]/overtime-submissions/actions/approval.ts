'use server';

import { auth } from '@/lib/auth';
import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import {
  revalidateOvertime,
  sendRejectionEmailToEmployee,
  sendApprovalEmailToEmployee,
} from './utils';
import { redirectToAuth } from '@/app/[lang]/actions';

/**
 * Approve overtime submission
 * Supports dual-stage approval for overtime requests:
 * - Stage 1: Supervisor approval (pending → pending-plant-manager)
 * - Stage 2: Plant Manager approval (pending-plant-manager → approved)
 * Regular submissions: pending → approved
 */
export async function approveOvertimeSubmission(id: string) {
  console.log('approveOvertimeSubmission', id);
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }

  // Check if user has HR or admin role for emergency override
  const userRoles = session.user?.roles ?? [];
  const isHR = userRoles.includes('hr');
  const isAdmin = userRoles.includes('admin');
  const isPlantManager = userRoles.includes('plant-manager');

  try {
    const coll = await dbc('overtime_submissions');

    // First check if this submission exists
    const submission = await coll.findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return { error: 'not found' };
    }

    // Dual approval logic for overtime requests
    if (submission.overtimeRequest) {
      if (submission.status === 'pending') {
        // Supervisor approval: move to pending-plant-manager OR directly to approved
        if (
          submission.supervisor !== session.user.email &&
          !isHR &&
          !isAdmin
        ) {
          return { error: 'unauthorized' };
        }

        // If supervisor is also a plant manager, complete approval in one step
        if (isPlantManager || isAdmin) {
          const update = await coll.updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                status: 'approved',
                supervisorApprovedAt: new Date(),
                supervisorApprovedBy: session.user.email,
                plantManagerApprovedAt: new Date(),
                plantManagerApprovedBy: session.user.email,
                approvedAt: new Date(),
                approvedBy: session.user.email,
                editedAt: new Date(),
                editedBy: session.user.email,
              },
            },
          );
          if (update.matchedCount === 0) {
            return { error: 'not found' };
          }
          revalidateTag('overtime');
          await sendApprovalEmailToEmployee(submission.submittedBy, id, 'final');
          return { success: 'approved' };
        }

        // Otherwise, move to pending-plant-manager for second approval
        const update = await coll.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: 'pending-plant-manager',
              supervisorApprovedAt: new Date(),
              supervisorApprovedBy: session.user.email,
              editedAt: new Date(),
              editedBy: session.user.email,
            },
          },
        );
        if (update.matchedCount === 0) {
          return { error: 'not found' };
        }
        revalidateTag('overtime');
        await sendApprovalEmailToEmployee(submission.submittedBy, id, 'supervisor');
        return { success: 'supervisor-approved' };
      } else if (submission.status === 'pending-plant-manager') {
        // Only plant manager can approve
        if (!isPlantManager && !isAdmin) {
          return { error: 'unauthorized' };
        }
        const update = await coll.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: 'approved',
              plantManagerApprovedAt: new Date(),
              plantManagerApprovedBy: session.user.email,
              approvedAt: new Date(),
              approvedBy: session.user.email,
              editedAt: new Date(),
              editedBy: session.user.email,
            },
          },
        );
        if (update.matchedCount === 0) {
          return { error: 'not found' };
        }
        revalidateTag('overtime');
        await sendApprovalEmailToEmployee(submission.submittedBy, id, 'final');
        return { success: 'plant-manager-approved' };
      } else {
        return { error: 'invalid status' };
      }
    }
    // Non-payment or fallback to old logic
    // Allow approval if:
    // 1. User is the assigned supervisor, OR
    // 2. User has HR role, OR
    // 3. User has admin role
    if (submission.supervisor !== session.user.email && !isHR && !isAdmin) {
      return {
        error: 'unauthorized',
      };
    }
    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: session.user.email,
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );
    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }
    revalidateTag('overtime');
    await sendApprovalEmailToEmployee(submission.submittedBy, id, 'final');
    return { success: 'approved' };
  } catch (error) {
    console.error(error);
    return { error: 'approveOvertimeSubmission server action error' };
  }
}

/**
 * Reject overtime submission
 * Sends rejection email notification to submitter
 */
export async function rejectOvertimeSubmission(
  id: string,
  rejectionReason: string,
) {
  console.log('rejectOvertimeSubmission', id);
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }

  // Check if user has HR or admin role for emergency override
  const userRoles = session.user?.roles ?? [];
  const isHR = userRoles.includes('hr');
  const isAdmin = userRoles.includes('admin');

  try {
    const coll = await dbc('overtime_submissions');

    // First check if this submission exists
    const submission = await coll.findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return { error: 'not found' };
    }

    // Allow rejection if:
    // 1. User is the assigned supervisor, OR
    // 2. User has HR role, OR
    // 3. User has admin role
    if (submission.supervisor !== session.user.email && !isHR && !isAdmin) {
      return {
        error: 'unauthorized',
      };
    }

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy: session.user.email,
          rejectionReason: rejectionReason,
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );
    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }
    revalidateOvertime();
    await sendRejectionEmailToEmployee(
      submission.submittedBy,
      id,
      rejectionReason,
    );
    return { success: 'rejected' };
  } catch (error) {
    console.error(error);
    return { error: 'rejectOvertimeSubmission server action error' };
  }
}

/**
 * Mark overtime submission as accounted (settled)
 * Only HR and Admin can perform this action
 */
export async function markAsAccountedOvertimeSubmission(id: string) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }

  const isHR = (session.user?.roles ?? []).includes('hr');
  const isAdmin = (session.user?.roles ?? []).includes('admin');

  if (!isHR && !isAdmin) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('overtime_submissions');
    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'accounted',
          accountedAt: new Date(),
          accountedBy: session.user.email,
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );
    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }
    revalidateOvertime();
    return { success: 'accounted' };
  } catch (error) {
    console.error(error);
    return { error: 'markAsAccountedOvertimeSubmission server action error' };
  }
}
