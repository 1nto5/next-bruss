'use server';

import { dbc } from '@/lib/mongo';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
import { DeviationType } from '@/lib/types/deviation';
import { AddDeviationType } from '@/lib/z/addDeviation';
import { getInitialsFromEmail } from '@/lib/utils/nameFormat';

export async function insertDeviation(deviation: AddDeviationType) {
  try {
    const session = await auth();
    if (!session) {
      redirect('/auth');
    }

    const collection = await dbc('deviations');

    const email = session.user.email;
    if (!email) {
      redirect('/auth');
    }

    const initials = getInitialsFromEmail(email);

    const latestDeviation = await collection
      .find({ deviationId: { $regex: `^${initials}` } })
      .sort({ deviationId: -1 })
      .limit(1)
      .toArray();

    let newIdNumber = 1;
    if (latestDeviation.length > 0) {
      const latestId = latestDeviation[0].deviationId;
      const latestNumber = parseInt(latestId.replace(initials, ''), 10);
      newIdNumber = latestNumber + 1;
    }

    const id = `${initials}${newIdNumber}`;

    const deviationToInsert: DeviationType = {
      deviationId: id,
      status: 'approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && { quantity: Number(deviation.quantity) }),
      ...(deviation.charge && { charge: deviation.charge }),
      reason: deviation.reason,
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      ...(deviation.area && { area: deviation.area }),
      ...(deviation.description && { description: deviation.description }),
      ...(deviation.processSpecification && {
        processSpecification: deviation.processSpecification,
      }),
      createdAt: new Date(),
      ...(deviation.customerNumber && {
        customerNumber: deviation.customerNumber,
      }),
      customerAuthorization: deviation.customerAuthorization,
      owner: email,
    };

    const res = await collection.insertOne(deviationToInsert);
    if (res) {
      revalidateTag('deviations');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the deviation.');
  }
}

export async function insertDraftDeviation(deviation: AddDeviationType) {
  try {
    const session = await auth();
    if (!session) {
      redirect('/auth');
    }

    const collection = await dbc('deviations');

    const email = session.user.email;
    if (!email) {
      redirect('/auth');
    }

    const initials = getInitialsFromEmail(email);

    const latestDeviation = await collection
      .find({ deviationId: { $regex: `^${initials}` } })
      .sort({ deviationId: -1 })
      .limit(1)
      .toArray();

    let newIdNumber = 1;
    if (latestDeviation.length > 0) {
      const latestId = latestDeviation[0].deviationId;
      const latestNumber = parseInt(latestId.replace(initials, ''), 10);
      newIdNumber = latestNumber + 1;
    }

    const id = `${initials}${newIdNumber}`;

    const deviationToInsert: DeviationType = {
      deviationId: id,
      status: 'draft',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && { quantity: Number(deviation.quantity) }),
      ...(deviation.charge && { charge: deviation.charge }),
      reason: deviation.reason,
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      ...(deviation.area && { area: deviation.area }),
      ...(deviation.description && { description: deviation.description }),
      ...(deviation.processSpecification && {
        processSpecification: deviation.processSpecification,
      }),
      createdAt: new Date(),
      ...(deviation.customerNumber && {
        customerNumber: deviation.customerNumber,
      }),
      customerAuthorization: deviation.customerAuthorization,
      owner: email,
    };

    const res = await collection.insertOne(deviationToInsert);
    if (res) {
      revalidateTag('deviations');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred while saving the deviation.');
  }
}
