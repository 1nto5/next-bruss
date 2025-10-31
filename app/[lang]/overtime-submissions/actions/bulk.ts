'use server';

import { auth } from '@/lib/auth';
import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import {
  revalidateOvertime,
  sendRejectionEmailToEmployee,
  sendApprovalEmailToEmployee,
} from './utils';
import { redirectToAuth } from '@/app/[lang]/actions';

/**
 * Bulk approve overtime submissions
 * Handles three approval paths:
 * 1. Supervisor approval for overtime requests (pending → pending-plant-manager)
 * 2. Plant Manager approval for overtime requests (pending-plant-manager → approved)
 * 3. Normal approval (pending → approved)
 */
export async function bulkApproveOvertimeSubmissions(ids: string[]) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }

  const userRoles = session.user?.roles ?? [];
  const isHR = userRoles.includes('hr');
  const isAdmin = userRoles.includes('admin');
  const isPlantManager = userRoles.includes('plant-manager');

  try {
    const coll = await dbc('overtime_submissions');
    const objectIds = ids.map((id) => new ObjectId(id));

    // First, check permissions for each submission
    const submissions = await coll.find({ _id: { $in: objectIds } }).toArray();

    // Group submissions by required action
    // Group 1: overtimeRequest + pending → supervisor approval (move to pending-plant-manager)
    const supervisorApprovalIds = submissions
      .filter((submission) => {
        return (
          submission.overtimeRequest &&
          submission.status === 'pending' &&
          (submission.supervisor === session.user.email || isHR || isAdmin)
        );
      })
      .map((submission) => submission._id);

    // Group 2: overtimeRequest + pending-plant-manager → plant manager approval (move to approved)
    const plantManagerApprovalIds = submissions
      .filter((submission) => {
        return (
          submission.overtimeRequest &&
          submission.status === 'pending-plant-manager' &&
          (isPlantManager || isAdmin)
        );
      })
      .map((submission) => submission._id);

    // Group 3: non-overtimeRequest + pending → normal approval (move to approved)
    const normalApprovalIds = submissions
      .filter((submission) => {
        return (
          !submission.overtimeRequest &&
          submission.status === 'pending' &&
          (submission.supervisor === session.user.email || isHR || isAdmin)
        );
      })
      .map((submission) => submission._id);

    let totalModified = 0;

    // Execute supervisor approvals (pending → pending-plant-manager)
    if (supervisorApprovalIds.length > 0) {
      const supervisorSubmissions = submissions.filter((s) =>
        supervisorApprovalIds.some((id) => id.equals(s._id))
      );

      const result = await coll.updateMany(
        { _id: { $in: supervisorApprovalIds } },
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
      totalModified += result.modifiedCount;

      // Send supervisor approval emails
      for (const submission of supervisorSubmissions) {
        await sendApprovalEmailToEmployee(
          submission.submittedBy,
          submission._id.toString(),
          'supervisor'
        );
      }
    }

    // Execute plant manager approvals (pending-plant-manager → approved)
    if (plantManagerApprovalIds.length > 0) {
      const plantManagerSubmissions = submissions.filter((s) =>
        plantManagerApprovalIds.some((id) => id.equals(s._id))
      );

      const result = await coll.updateMany(
        { _id: { $in: plantManagerApprovalIds } },
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
      totalModified += result.modifiedCount;

      // Send final approval emails
      for (const submission of plantManagerSubmissions) {
        await sendApprovalEmailToEmployee(
          submission.submittedBy,
          submission._id.toString(),
          'final'
        );
      }
    }

    // Execute normal approvals (pending → approved)
    if (normalApprovalIds.length > 0) {
      const normalSubmissions = submissions.filter((s) =>
        normalApprovalIds.some((id) => id.equals(s._id))
      );

      const result = await coll.updateMany(
        { _id: { $in: normalApprovalIds } },
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
      totalModified += result.modifiedCount;

      // Send final approval emails
      for (const submission of normalSubmissions) {
        await sendApprovalEmailToEmployee(
          submission.submittedBy,
          submission._id.toString(),
          'final'
        );
      }
    }

    if (totalModified === 0) {
      return { error: 'no valid submissions' };
    }

    revalidateOvertime();
    return {
      success: 'approved',
      count: totalModified,
      total: ids.length,
    };
  } catch (error) {
    console.error(error);
    return { error: 'bulkApproveOvertimeSubmissions server action error' };
  }
}

/**
 * Bulk reject overtime submissions
 * Sends rejection email to each affected employee
 */
export async function bulkRejectOvertimeSubmissions(
  ids: string[],
  rejectionReason: string,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }

  const userRoles = session.user?.roles ?? [];
  const isHR = userRoles.includes('hr');
  const isAdmin = userRoles.includes('admin');

  try {
    const coll = await dbc('overtime_submissions');
    const objectIds = ids.map((id) => new ObjectId(id));

    // First, check permissions for each submission
    const submissions = await coll.find({ _id: { $in: objectIds } }).toArray();

    const allowedSubmissions = submissions.filter((submission) => {
      // Allow rejection if user is supervisor, HR, or admin
      return (
        (submission.supervisor === session.user.email || isHR || isAdmin) &&
        submission.status === 'pending'
      );
    });

    if (allowedSubmissions.length === 0) {
      return { error: 'no valid submissions' };
    }

    const allowedIds = allowedSubmissions.map((submission) => submission._id);

    const updateResult = await coll.updateMany(
      { _id: { $in: allowedIds } },
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

    // Send rejection emails
    for (const submission of allowedSubmissions) {
      await sendRejectionEmailToEmployee(
        submission.submittedBy,
        submission._id.toString(),
        rejectionReason,
      );
    }

    revalidateOvertime();
    return {
      success: 'rejected',
      count: updateResult.modifiedCount,
      total: ids.length,
    };
  } catch (error) {
    console.error(error);
    return { error: 'bulkRejectOvertimeSubmissions server action error' };
  }
}

/**
 * Bulk mark overtime submissions as accounted (settled)
 * Only HR and Admin can perform this action
 * Only approved submissions can be marked as accounted
 */
export async function bulkMarkAsAccountedOvertimeSubmissions(ids: string[]) {
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
    const objectIds = ids.map((id) => new ObjectId(id));

    const updateResult = await coll.updateMany(
      {
        _id: { $in: objectIds },
        status: 'approved', // Only approved submissions can be marked as accounted
      },
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

    revalidateOvertime();
    return {
      success: 'accounted',
      count: updateResult.modifiedCount,
      total: ids.length,
    };
  } catch (error) {
    console.error(error);
    return {
      error: 'bulkMarkAsAccountedOvertimeSubmissions server action error',
    };
  }
}

/**
 * Bulk cancel overtime requests
 * Only submitter can cancel their own pending submissions
 */
export async function bulkCancelOvertimeRequests(ids: string[]) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirectToAuth();
  }

  try {
    const coll = await dbc('overtime_submissions');
    const objectIds = ids.map((id) => new ObjectId(id));

    // Only allow cancellation of own pending submissions
    const updateResult = await coll.updateMany(
      {
        _id: { $in: objectIds },
        submittedBy: session.user.email,
        status: 'pending',
      },
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

    revalidateOvertime();
    return {
      success: 'cancelled',
      count: updateResult.modifiedCount,
      total: ids.length,
    };
  } catch (error) {
    console.error(error);
    return { error: 'bulkCancelOvertimeRequests server action error' };
  }
}
