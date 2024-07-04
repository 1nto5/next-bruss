'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { ObjectId } from 'mongodb';
import { EmployeeType } from '@/lib/types/employee';

export async function insertEmployee(employee: EmployeeType) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('persons');

    const exists = await collection.findOne({
      personalNumber: employee.loginCode,
    });

    if (exists) {
      return { error: 'exists' };
    }

    const res = await collection.insertOne({
      name: employee.name,
      personalNumber: employee.loginCode,
      password: employee.password,
    });
    if (res) {
      revalidateTag('employees');
      return { success: 'inserted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the user.');
  }
}

export async function insertManyEmployee(pastedEmployees: string) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
      return; // Make sure to stop the execution after redirecting
    }

    const employees = pastedEmployees
      .split('\n')
      .map((line) => line.split('\t'))
      .map(([name, loginCode]) => {
        const [lastName, firstName] = name.split(', ').map((s) => s.trim());
        return {
          name: `${firstName} ${lastName}`,
          loginCode,
        };
      });

    const collection = await dbc('persons');

    const existingEmployees = await collection
      .find({
        personalNumber: { $in: employees.map((e) => e.loginCode) },
        name: { $ne: '' },
        loginCode: { $ne: '' },
      })
      .toArray();

    const existingLoginCodes = existingEmployees.map((e) => e.personalNumber);

    const newEmployees = employees.filter(
      (e) => !existingLoginCodes.includes(e.loginCode) && e.name && e.loginCode,
    );

    console.log('newEmployees', newEmployees);

    const res = await collection.insertMany(
      newEmployees.map((employee) => ({
        name: employee.name,
        personalNumber: employee.loginCode,
      })),
    );

    if (res.insertedCount > 0) {
      revalidateTag('employees');
      return { success: res.insertedCount };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving employees.');
  }
}

export async function updateEmployee(employee: EmployeeType) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('persons');

    const exists = await collection.findOne({
      _id: new ObjectId(employee._id),
    });

    if (!exists) {
      return { error: 'not exists' };
    }

    const res = await collection.updateOne(
      { _id: new ObjectId(employee._id) },
      {
        $set: {
          name: employee.name,
          personalNumber: employee.loginCode,
          password: employee.password,
        },
      },
    );
    if (res) {
      revalidateTag('employees');
      return { success: 'updated' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the user.');
  }
}

export async function getEmployee(
  userId: ObjectId,
): Promise<EmployeeType | null> {
  try {
    const collection = await dbc('persons');
    const user = await collection.findOne({
      _id: userId,
    });

    if (user) {
      return {
        _id: user._id.toString(),
        name: user.name,
        loginCode: user.personalNumber,
        password: user.password ?? undefined,
      };
    }

    return null;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while retrieving the user.');
  }
}

export async function deleteEmployee(userId: string) {
  try {
    const session = await auth();
    if (!session || !(session.user.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('persons');

    const exists = await collection.findOne({ _id: new ObjectId(userId) });

    if (!exists) {
      return { error: 'not found' };
    }

    const res = await collection.deleteOne({ _id: new ObjectId(userId) });
    if (res) {
      revalidateTag('users');
      return { success: 'deleted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while deleting the user');
  }
}

export async function revalidateUsers() {
  revalidateTag('employees');
}
