'use server';

import { auth } from '@/lib/auth';
import mailer from '@/lib/services/mailer';
import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { OvertimeSubmissionType } from './lib/zod';

export async function revalidateOvertime() {
  revalidateTag('overtime');
}

export async function revalidateOvertimeSubmission() {
  revalidateTag('overtime-submission');
}

export async function redirectToOvertime(lang: string) {
  redirect(`/${lang}/overtime-submissions`);
}

export async function redirectToOvertimeSubmission(id: string, lang: string) {
  redirect(`/${lang}/overtime-submissions/${id}`);
}

async function sendRejectionEmailToEmployee(
  email: string,
  id: string,
  rejectionReason?: string,
) {
  const subject = 'Odrzucone nadgodziny';
  const additionalText = rejectionReason
    ? `<p><strong>Powód odrzucenia:</strong> ${rejectionReason}</p>`
    : '';
  const mailOptions = {
    to: email,
    subject,
    html: `<div style="font-family: sans-serif;">
          <p>Twoje zgłoszenie nadgodzin zostało odrzucone.</p>
          ${additionalText}
          <p>
          <a href="${process.env.BASE_URL}/overtime/${id}" 
             style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">
            Otwórz zgłoszenie
          </a>
          </p>
        </div>`,
  };
  await mailer(mailOptions);
}

export async function updateOvertimeSubmission(
  id: string,
  data: OvertimeSubmissionType,
): Promise<{ success: 'updated' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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
      changes.supervisor = { from: submission.supervisor, to: updateData.supervisor };
    }
    if (new Date(updateData.date).getTime() !== new Date(submission.date).getTime()) {
      changes.date = { from: submission.date, to: updateData.date };
    }
    if (updateData.hours !== submission.hours) {
      changes.hours = { from: submission.hours, to: updateData.hours };
    }
    if (updateData.reason !== submission.reason) {
      changes.reason = { from: submission.reason, to: updateData.reason };
    }
    if (updateData.overtimeRequest !== submission.overtimeRequest) {
      changes.overtimeRequest = { from: submission.overtimeRequest, to: updateData.overtimeRequest };
    }
    if (updateData.payment !== submission.payment) {
      changes.payment = { from: submission.payment, to: updateData.payment };
    }
    const oldScheduledDayOff = submission.scheduledDayOff ? new Date(submission.scheduledDayOff).getTime() : undefined;
    const newScheduledDayOff = updateData.scheduledDayOff ? new Date(updateData.scheduledDayOff).getTime() : undefined;
    if (oldScheduledDayOff !== newScheduledDayOff) {
      changes.scheduledDayOff = { from: submission.scheduledDayOff, to: updateData.scheduledDayOff };
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

export async function editOvertimeSubmission(
  id: string,
  data: OvertimeSubmissionType,
): Promise<{ success: 'updated' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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
    if (new Date(data.date).getTime() !== new Date(submission.date).getTime()) {
      changes.date = { from: submission.date, to: data.date };
    }
    if (data.hours !== submission.hours) {
      changes.hours = { from: submission.hours, to: data.hours };
    }
    if (data.reason !== submission.reason) {
      changes.reason = { from: submission.reason, to: data.reason };
    }
    if (data.overtimeRequest !== submission.overtimeRequest) {
      changes.overtimeRequest = { from: submission.overtimeRequest, to: data.overtimeRequest };
    }
    if (data.payment !== submission.payment) {
      changes.payment = { from: submission.payment, to: data.payment };
    }
    const oldScheduledDayOff = submission.scheduledDayOff ? new Date(submission.scheduledDayOff).getTime() : undefined;
    const newScheduledDayOff = data.scheduledDayOff ? new Date(data.scheduledDayOff).getTime() : undefined;
    if (oldScheduledDayOff !== newScheduledDayOff) {
      changes.scheduledDayOff = { from: submission.scheduledDayOff, to: data.scheduledDayOff };
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

export async function cancelOvertimeRequest(id: string) {
  // Log the cancellation attempt for debugging purposes
  console.log('cancelOvertimeRequest', id);
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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

export async function approveOvertimeSubmission(id: string) {
  console.log('approveOvertimeSubmission', id);
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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
        // Supervisor approval: move to pending-plant-manager
        if (submission.supervisor !== session.user.email && !isHR && !isAdmin) {
          return { error: 'unauthorized' };
        }
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
    return { success: 'approved' };
  } catch (error) {
    console.error(error);
    return { error: 'approveOvertimeSubmission server action error' };
  }
}

export async function rejectOvertimeSubmission(
  id: string,
  rejectionReason: string,
) {
  console.log('rejectOvertimeSubmission', id);
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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

async function generateNextInternalId(): Promise<string> {
  try {
    const collection = await dbc('overtime_submissions');
    const currentYear = new Date().getFullYear();
    const shortYear = currentYear.toString().slice(-2);

    // Regex to match and extract the numeric part of IDs like "123/25"
    const yearRegex = new RegExp(`^(\\d+)\\/${shortYear}$`);

    // Fetch all overtime internalIds for the current year.
    // We only need the internalId field for this operation.
    const overtimeThisYear = await collection
      .find(
        { internalId: { $regex: `\\/${shortYear}$` } }, // Filter for IDs ending with "/YY"
        { projection: { internalId: 1 } }, // Only fetch the internalId field
      )
      .toArray();

    let maxNumber = 0;
    for (const doc of overtimeThisYear) {
      if (doc.internalId) {
        const match = doc.internalId.match(yearRegex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      }
    }

    const nextNumber = maxNumber + 1;
    return `${nextNumber}/${shortYear}`;
  } catch (error) {
    console.error('Failed to generate internal ID:', error);
    // Fallback to a timestamp-based ID if there's an error.
    return `${Date.now()}/${new Date().getFullYear().toString().slice(-2)}`;
  }
}

export async function insertOvertimeSubmission(
  data: OvertimeSubmissionType,
): Promise<{ success: 'inserted' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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

export async function markAsAccountedOvertimeSubmission(id: string) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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

// Bulk actions
export async function bulkApproveOvertimeSubmissions(ids: string[]) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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
    }

    // Execute plant manager approvals (pending-plant-manager → approved)
    if (plantManagerApprovalIds.length > 0) {
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
    }

    // Execute normal approvals (pending → approved)
    if (normalApprovalIds.length > 0) {
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

export async function bulkRejectOvertimeSubmissions(
  ids: string[],
  rejectionReason: string,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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

export async function bulkMarkAsAccountedOvertimeSubmissions(ids: string[]) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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

export async function bulkCancelOvertimeRequests(ids: string[]) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
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
