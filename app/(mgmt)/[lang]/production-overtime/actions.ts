'use server';

import { auth } from '@/auth';
import mailer from '@/lib/mailer';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { overtimeRequestEmployeeType } from './lib/types';
import { NewOvertimeRequestType } from './lib/zod';

export async function revalidateProductionOvertime() {
  revalidateTag('production-overtime');
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

async function sendEmailNotificationToRequestor(email: string, id: string) {
  const mailOptions = {
    to: email,
    subject:
      'Zatwierdzone zlecanie wykonania pracy w godzinach nadliczbowych - produkcja',
    html: `<div style="font-family: sans-serif;">
          <p>Twoje zlecenie wykonania pracy w godzinach nadliczbowych - produkcja zostało zatwierdzone.</p>
          <p>
          <a href="${process.env.APP_URL}/production-overtime/${id}" 
             style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">
            Otwórz zlecenie
          </a>
          </p>
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

  const isPlantManager = (session.user?.roles ?? []).includes('plant-manager');
  const isAdmin = (session.user?.roles ?? []).includes('admin');

  if (!isPlantManager && !isAdmin) {
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

    // Check if status allows modifications
    if (request.status === 'closed' || request.status === 'rejected') {
      return { error: 'invalid status' };
    }

    if (
      request.requestedBy !== session.user.email &&
      !session.user.roles?.includes('production-manager') &&
      !session.user.roles?.includes('group-leader') &&
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

export async function cancelOvertimeRequest(id: string) {
  console.log('cancelOvertimeRequest', id);
  const session = await auth();
  if (!session || !session.user?.email) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('production_overtime');

    // First check if the request exists and get its current status
    const request = await coll.findOne({ _id: new ObjectId(id) });
    if (!request) {
      return { error: 'not found' };
    }

    // Don't allow canceling if status is completed, closed, or already canceled
    if (
      request.status === 'completed' ||
      request.status === 'closed' ||
      request.status === 'canceled'
    ) {
      return { error: 'cannot cancel' };
    }

    // Check if user has permission to cancel (requestor, plant manager, admin, group leader, production manager, or HR)
    if (
      request.requestedBy !== session.user.email &&
      !session.user.roles?.includes('plant-manager') &&
      !session.user.roles?.includes('admin') &&
      !session.user.roles?.includes('group-leader') &&
      !session.user.roles?.includes('production-manager') &&
      !session.user.roles?.includes('hr')
    ) {
      return { error: 'unauthorized' };
    }

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'canceled',
          canceledAt: new Date(),
          canceledBy: session.user.email,
          editedAt: new Date(),
          editedBy: session.user.email,
        },
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }

    revalidateProductionOvertime();
    return { success: 'canceled' };
  } catch (error) {
    console.error(error);
    return { error: 'cancelOvertimeRequest server action error' };
  }
}
