'use server';

import { auth } from '@/auth';
import mailer from '@/lib/mailer';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { overtimeRequestEmployeeType } from './lib/production-overtime-types';
import { NewOvertimeRequestType } from './lib/production-overtime-zod';

export async function revalidateProductionOvertime() {
  revalidateTag('production-overtime');
}

export async function revalidateProductionOvertimeRequest() {
  revalidateTag('production-overtime-request');
}

export async function redirectToProductionOvertime() {
  redirect('/production-overtime');
}

export async function insertDraftOvertimeRequest(
  data: NewOvertimeRequestType,
): Promise<{ success: 'inserted' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('production_overtime');
    const draftRequestToInsert = {
      status: 'draft',
      ...data,
      createdAt: new Date(),
      createdBy: session.user.email,
      editedAt: new Date(),
    };
    const res = await coll.insertOne(draftRequestToInsert);
    if (res.insertedId) {
      return { success: 'inserted' };
    }
    return { error: 'not inserted' };
  } catch (error) {
    console.error(error);
    return { error: 'insertDraftOvertimeRequest server action error' };
  }
}

export async function deleteOvertimeRequestDraft(id: string) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return { error: 'unauthorized' };
  }
  console.log('deleteOvertimeRequestDraft', id);
  try {
    const coll = await dbc('production_overtime');

    const request = await coll.findOne({ _id: new ObjectId(id) });

    if (!request) {
      console.log('not found');
      return { error: 'not found' };
    }

    if (request.status !== 'draft') {
      console.log('not draft');
      return { error: 'not draft' };
    }

    if (request.requestedBy !== session.user?.email) {
      console.log('unauthorized');
      return { error: 'unauthorized' };
    }

    const res = await coll.deleteOne({ _id: new ObjectId(id) });
    if (res) {
      revalidateProductionOvertime();
      return { success: 'deleted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('deleteDraftOvertimeRequest server action error');
  }
}

async function sendEmailNotificationToRequestor(email: string, id: string) {
  const mailOptions = {
    to: email,
    subject:
      'Zatwierdzone zlecanie wykonania pracy w godzinach nadliczbowych - produkcja',
    html: `<div style="font-family: sans-serif;">
          <p style="padding-bottom: 20px;">Twoje zlecenie wykonania pracy w godzinach nadliczbowych - produkcja zostało zatwierdzone.</p>
          <a href="${process.env.APP_URL}/production-overtime/${id}" 
             style="background-color: #4CAF50; color: white; padding: 10px 15px; 
             text-align: center; text-decoration: none; display: inline-block; 
             border-radius: 4px; font-weight: bold; margin-top: 10px;">
            Otwórz zlecenie
          </a>
        </div>`,
  };
  await mailer(mailOptions);
}

export async function approveOvertimeRequest(id: string) {
  console.log('approveOvertimeRequest', id);
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  if (!(session.user?.roles ?? []).includes('plant-manager')) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('production_overtime');
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
    revalidateProductionOvertime();
    await sendEmailNotificationToRequestor(session.user.email, id);
    return { success: 'approved' };
  } catch (error) {
    console.error(error);
    return { error: 'approveOvertimeRequest server action error' };
  }
}

export async function insertOvertimeRequest(
  data: NewOvertimeRequestType,
): Promise<{ success: 'inserted' } | { error: string }> {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('production_overtime');

    const overtimeRequestToInsert = {
      status: 'pending',
      ...data,
      requestedAt: new Date(),
      requestedBy: session.user.email,
      editedAt: new Date(),
      editedBy: session.user.email,
    };

    const res = await coll.insertOne(overtimeRequestToInsert);
    if (res) {
      revalidateTag('production-overtime');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertOvertimeRequest server action error' };
  }
}

export async function replaceEmployee(
  overtimeId: string,
  toReplaceEmployeeArrayPosition: number,
  newEmployee: overtimeRequestEmployeeType,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('production_overtime');

    // Check if the user is authorized to modify this request
    const request = await coll.findOne({ _id: new ObjectId(overtimeId) });
    if (!request) {
      return { error: 'not found' };
    }

    if (
      request.requestedBy !== session.user.email &&
      !session.user.roles?.includes('plant-manager') &&
      !session.user.roles?.includes('hr')
    ) {
      return { error: 'unauthorized' };
    }

    const update = await coll.updateOne(
      { _id: new ObjectId(overtimeId) },
      {
        $set: {
          [`employees.${toReplaceEmployeeArrayPosition}`]: newEmployee,
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );
    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }
    revalidateProductionOvertime();
    return { success: 'replaced' };
  } catch (error) {
    console.error(error);
    return { error: 'replaceEmployee server action error' };
  }
}

export async function deleteEmployee(
  overtimeId: string,
  employeeIndex: number,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('production_overtime');

    // Check if the user is authorized to modify this request
    const request = await coll.findOne({ _id: new ObjectId(overtimeId) });
    if (!request) {
      return { error: 'not found' };
    }

    if (
      request.requestedBy !== session.user.email &&
      !session.user.roles?.includes('plant-manager') &&
      !session.user.roles?.includes('hr')
    ) {
      return { error: 'unauthorized' };
    }

    const update = await coll.updateOne(
      { _id: new ObjectId(overtimeId) },
      {
        $set: {
          [`employees.${employeeIndex}.status`]: 'deleted',
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );
    console.log('deleteEmployee update', update);
    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }
    revalidateProductionOvertime();
    return { success: 'deleted' };
  } catch (error) {
    console.error(error);
    return { error: 'deleteEmployee server action error' };
  }
}

export async function reportAbsence(overtimeId: string, employeeIndex: number) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('production_overtime');

    console.log('reportAbsence', overtimeId, employeeIndex);
    // Check if the user is authorized to modify this request
    const request = await coll.findOne({ _id: new ObjectId(overtimeId) });
    if (!request) {
      return { error: 'not found' };
    }

    if (
      request.requestedBy !== session.user.email &&
      !session.user.roles?.includes('plant-manager') &&
      !session.user.roles?.includes('hr')
    ) {
      return { error: 'unauthorized' };
    }

    const update = await coll.updateOne(
      { _id: new ObjectId(overtimeId) },
      {
        $set: {
          [`employees.${employeeIndex}.status`]: 'absent',
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );
    if (update.matchedCount === 0) {
      return { error: 'not found employee' };
    }
    revalidateProductionOvertime();
    return { success: 'reported' };
  } catch (error) {
    console.error(error);
    return { error: 'reportAbsence server action error' };
  }
}
