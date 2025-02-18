'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { EmployeeType, InsertEmployeeType } from './lib/employee-types';

export async function insertEmployee(data: InsertEmployeeType) {
  try {
    const session = await auth();
    if (!session || !(session.user?.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('employees');

    const exists = await collection.findOne({ identifier: data.identifier });
    if (exists) {
      return { error: 'exists' };
    }

    const res = await collection.insertOne(data);
    if (res.insertedId) {
      revalidateTag('employees');
      return { success: 'inserted' };
    }

    return { error: 'not inserted' };
  } catch (error) {
    console.error(error);
    return { error: 'insertEmployee server action error' };
  }
}

export async function insertManyEmployee(pastedEmployees: string) {
  try {
    const session = await auth();
    if (!session || !(session?.user?.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const employees = pastedEmployees
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        let parts = line.split(/[,\t]+/).map((part) => part.trim());
        if (parts.length < 3) {
          parts = line.split(/\s+/).map((part) => part.trim());
        }
        if (parts.length < 3) {
          throw new Error(`Invalid employee data: ${line}`);
        }
        const clean = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '');
        const firstName = clean(parts[0]);
        const identifier = clean(parts[parts.length - 1]);
        const lastName = clean(parts.slice(1, parts.length - 1).join(' '));
        return { firstName, lastName, identifier };
      });

    const collection = await dbc('employees');

    for (const employee of employees) {
      const existingEmployee = await collection.findOne({
        identifier: employee.identifier,
      });

      if (existingEmployee) {
        await collection.updateOne(
          { identifier: employee.identifier },
          {
            $set: {
              firstName: employee.firstName,
              lastName: employee.lastName,
            },
          },
        );
      } else {
        await collection.insertOne({
          firstName: employee.firstName,
          lastName: employee.lastName,
          identifier: employee.identifier,
        });
      }
    }

    revalidateTag('employees');
    return { success: 'added' };
  } catch (error) {
    console.error(error);
    return { error: 'insertManyEmployee server action error' };
  }
}

export async function updateEmployee(data: EmployeeType) {
  try {
    const session = await auth();
    if (!session || !(session?.user?.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('employees');

    const exists = await collection.findOne({
      identifier: data.identifier,
    });

    if (!exists) {
      return { error: 'not exists' };
    }

    const res = await collection.updateOne(
      { identifier: data.identifier },
      {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          identifier: data.identifier,
          pin: data.pin,
        },
      },
    );
    if (res) {
      revalidateTag('employees');
      return { success: 'updated' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'updateEmployee server action error' };
  }
}

export async function getEmployee(
  userId: ObjectId,
): Promise<EmployeeType | null> {
  try {
    const collection = await dbc('employees');
    const user = await collection.findOne({ _id: userId });
    if (!user) return null;

    const { _id, firstName, lastName, identifier, pin } = user;
    return {
      _id: _id.toString(),
      firstName,
      lastName,
      identifier,
      pin,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteEmployee(userId: string) {
  try {
    const session = await auth();
    if (!session || !(session?.user?.roles ?? []).includes('admin')) {
      redirect('/');
    }

    const collection = await dbc('employees');

    const exists = await collection.findOne({ _id: new ObjectId(userId) });

    if (!exists) {
      return { error: 'not found' };
    }

    const res = await collection.deleteOne({ _id: new ObjectId(userId) });
    if (res) {
      revalidateTag('employees');
      return { success: 'deleted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'deleteEmployee server action error' };
  }
}

export async function revalidateEmployees() {
  revalidateTag('employees');
}
