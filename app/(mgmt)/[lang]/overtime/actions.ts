'use server';

import { auth } from '@/auth';
import mailer from '@/lib/mailer';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { OvertimeHoursSubmissionType } from './lib/zod';

export async function revalidateOvertime() {
  revalidateTag('overtime');
}

export async function revalidateOvertimeSubmission() {
  revalidateTag('overtime-submission');
}

export async function redirectToOvertime() {
  redirect('/overtime');
}

export async function redirectToOvertimeSubmission(id: string) {
  redirect(`/overtime/${id}`);
}

async function sendEmailNotificationToEmployee(
  email: string,
  id: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
) {
  const subject =
    status === 'approved'
      ? 'Zatwierdzone godziny nadliczbowe'
      : 'Odrzucone godziny nadliczbowe';

  const statusText = status === 'approved' ? 'zatwierdzone' : 'odrzucone';
  const additionalText =
    status === 'rejected' && rejectionReason
      ? `<p><strong>Powód odrzucenia:</strong> ${rejectionReason}</p>`
      : '';

  const mailOptions = {
    to: email,
    subject,
    html: `<div style="font-family: sans-serif;">
          <p>Twoje zgłoszenie godzin nadliczbowych zostało ${statusText}.</p>
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

// Legacy function - no longer used in the new hours tracking system
export async function deleteDayOff(
  overtimeId: string,
  employeeIdentifier: string,
) {
  console.log(
    'deleteDayOff - legacy function called',
    overtimeId,
    employeeIdentifier,
  );
  return {
    error:
      'This function is deprecated. The overtime system now tracks hours worked, not compensatory days off.',
  };
}

export async function updateOvertimeSubmission(
  id: string,
  data: OvertimeHoursSubmissionType,
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
      return { error: 'cannot edit approved or rejected submission' };
    }

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          editedAt: new Date(),
          editedBy: session.user.email,
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

export async function cancelOvertimeRequest(id: string) {
  console.log('cancelOvertimeRequest', id);
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  try {
    const coll = await dbc('overtime_submissions');

    // First check if the submission exists and get its details
    const submission = await coll.findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return { error: 'not found' };
    }

    // Check if user can cancel this submission
    // Only the submitter can cancel their own submission, and only if it's still pending
    if (submission.submittedBy !== session.user.email) {
      return { error: 'unauthorized' };
    }

    if (submission.status !== 'pending') {
      return { error: 'cannot cancel' };
    }

    // Delete the submission
    const deleteResult = await coll.deleteOne({ _id: new ObjectId(id) });
    if (deleteResult.deletedCount === 0) {
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

  // Check if user has manager role (any role containing "manager")
  const userRoles = session.user?.roles ?? [];
  const isManager = userRoles.some((role) =>
    role.toLowerCase().includes('manager'),
  );
  const isAdmin = userRoles.includes('admin');
  const isHR = userRoles.includes('hr');

  if (!isManager && !isAdmin && !isHR) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('overtime_submissions');

    // First check if this user is the assigned supervisor
    const submission = await coll.findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return { error: 'not found' };
    }

    if (submission.supervisor !== session.user.email && !isAdmin) {
      return { error: 'unauthorized - not assigned supervisor' };
    }

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: session.user.email,
        },
      },
    );
    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }
    revalidateOvertime();
    await sendEmailNotificationToEmployee(
      submission.submittedBy,
      id,
      'approved',
    );
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

  // Check if user has manager role (any role containing "manager")
  const userRoles = session.user?.roles ?? [];
  const isManager = userRoles.some((role) =>
    role.toLowerCase().includes('manager'),
  );
  const isAdmin = userRoles.includes('admin');
  const isHR = userRoles.includes('hr');

  if (!isManager && !isAdmin && !isHR) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('overtime_submissions');

    // First check if this user is the assigned supervisor
    const submission = await coll.findOne({ _id: new ObjectId(id) });
    if (!submission) {
      return { error: 'not found' };
    }

    if (submission.supervisor !== session.user.email && !isAdmin) {
      return { error: 'unauthorized - not assigned supervisor' };
    }

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectedBy: session.user.email,
          rejectionReason: rejectionReason,
        },
      },
    );
    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }
    revalidateOvertime();
    await sendEmailNotificationToEmployee(
      submission.submittedBy,
      id,
      'rejected',
      rejectionReason,
    );
    return { success: 'rejected' };
  } catch (error) {
    console.error(error);
    return { error: 'rejectOvertimeSubmission server action error' };
  }
}

export async function insertOvertimeSubmission(
  data: OvertimeHoursSubmissionType,
): Promise<{ success: 'inserted' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('overtime_submissions');

    const overtimeSubmissionToInsert = {
      status: 'pending',
      ...data,
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

// Legacy function exports for backward compatibility
export async function approveOvertimeRequest(id: string) {
  return approveOvertimeSubmission(id);
}

export async function insertOvertimeRequest(data: any) {
  // This is a legacy function - redirect to new implementation
  return { error: 'Use insertOvertimeSubmission instead' };
}

export async function revalidateProductionOvertime() {
  revalidateOvertime();
}

export async function revalidateProductionOvertimeRequest() {
  revalidateOvertimeSubmission();
}

export async function redirectToProductionOvertime() {
  redirectToOvertime();
}

export async function redirectToProductionOvertimeDaysOff(id: string) {
  redirectToOvertimeSubmission(id);
}
