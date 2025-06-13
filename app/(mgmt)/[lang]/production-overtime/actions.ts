'use server';

import { auth } from '@/auth';
import mailer from '@/lib/mailer';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { overtimeRequestEmployeeType } from './lib/production-overtime-types';
import { NewOvertimeRequestType } from './lib/zod';

export async function revalidateProductionOvertime() {
  try {
    revalidateTag('production-overtime');
    return { success: true };
  } catch (error) {
    console.error('revalidateProductionOvertime error:', error);
    return { error: (error as Error).message };
  }
}

export async function revalidateProductionOvertimeRequest() {
  revalidateTag('production-overtime-request');
}

export async function redirectToProductionOvertime() {
  redirect('/production-overtime');
}

export async function redirectToProductionOvertimeDaysOff(id: string) {
  redirect(`/production-overtime/${id}`);
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

export async function deleteDayOff(
  overtimeId: string,
  employeeIdentifier: string,
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

    // Use $pull to remove the employee with specified identifier from the employeesWithScheduledDayOff array
    const update = await coll.updateOne(
      { _id: new ObjectId(overtimeId) },
      {
        $pull: {
          employeesWithScheduledDayOff: { identifier: employeeIdentifier },
        },
        $set: {
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }

    if (update.modifiedCount === 0) {
      return { error: 'not found employee' };
    }

    revalidateProductionOvertime();
    return { success: 'deleted' };
  } catch (error) {
    console.error(error);
    return { error: 'deleteTimeOffRequest server action error' };
  }
}

// Keep deleteEmployee for backward compatibility but make it call the new function
export async function deleteEmployee(
  overtimeId: string,
  employeeIndex: number,
) {
  // This is a temporary compatibility function
  // Get the identifier from the document and delegate to deleteTimeOffRequest
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const coll = await dbc('production_overtime');
    const request = await coll.findOne({ _id: new ObjectId(overtimeId) });
    if (!request) {
      return { error: 'not found' };
    }

    // Get employee at the specified index
    const employee = request.employeesWithScheduledDayOff[employeeIndex];
    if (!employee) {
      return { error: 'not found employee' };
    }

    // Call the new function with the identifier
    return await deleteDayOff(overtimeId, employee.identifier);
  } catch (error) {
    console.error(error);
    return { error: 'deleteEmployee server action error' };
  }
}

export async function addEmployeeDayOff(
  overtimeId: string,
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

    // Check if an employee with the same identifier already exists in the employeesWithScheduledDayOff array
    const employeeExists = request.employeesWithScheduledDayOff?.some(
      (employee: overtimeRequestEmployeeType) =>
        employee.identifier === newEmployee.identifier,
    );

    if (employeeExists) {
      return { error: 'employee already exists' };
    }

    // Check if the number of employees with scheduled days off doesn't exceed the total number
    const employeesWithDaysOffCount =
      request.employeesWithScheduledDayOff?.length || 0;

    // Check if adding another employee would exceed the total number of employees
    if (employeesWithDaysOffCount + 1 > request.numberOfEmployees) {
      return { error: 'too many employees with scheduled days off' };
    }

    // Add the new employee to the employeesWithScheduledDayOff array
    const update = await coll.updateOne(
      { _id: new ObjectId(overtimeId) },
      {
        $push: {
          employeesWithScheduledDayOff: newEmployee,
        },
        $set: {
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }

    revalidateProductionOvertime();
    revalidateProductionOvertimeRequest();
    return { success: 'added' };
  } catch (error) {
    console.error(error);
    return { error: 'addEmployeeDayOff server action error' };
  }
}
