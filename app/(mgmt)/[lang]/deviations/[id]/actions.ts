'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { ApprovalType, DeviationType } from '@/lib/types/deviation';
import { extractFullNameFromEmail } from '@/lib/utils/nameFormat';
import { AddDeviationType } from '@/lib/z/deviation';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import nodemailer from 'nodemailer';

export async function approveDeviation(id: string, userRole: string) {
  const session = await auth();
  if (
    !session ||
    !session.user.email ||
    !(session.user.roles ?? []).includes(userRole)
  ) {
    return { error: 'unauthorized' };
  }

  const approvalFieldMap: { [key: string]: keyof DeviationType } = {
    'group-leader': 'groupLeaderApproval',
    'quality-manager': 'qualityManagerApproval',
    'engineering-manager': 'engineeringManagerApproval',
    'maintenance-manager': 'maintenanceManagerApproval',
    'production-manager': 'productionManagerApproval',
  };

  const approvalField = approvalFieldMap[userRole];
  if (!approvalField) {
    return { error: 'invalid role' };
  }

  const updateField: Partial<DeviationType> = {
    [approvalField]: {
      approved: true,
      by: session.user.email,
      at: new Date(),
    } as ApprovalType,
  };

  try {
    const coll = await dbc('deviations');
    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateField,
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }
    revalidateDeviationsAndDeviation();
    return { success: 'approved' };
  } catch (error) {
    console.error(error);
    return { error: 'approveDeviation server action error' };
  }
}

export async function confirmCorrectiveActionExecution(
  id: string,
  correctiveActionIndex: number,
  executionTime: Date,
  additionalInfo?: string,
) {
  const session = await auth();
  if (!session || !session.user.email) {
    return { error: 'unauthorized' };
  }
  try {
    const coll = await dbc('deviations');
    const deviation = await coll.findOne({ _id: new ObjectId(id) });
    if (!deviation) {
      return { error: 'not found' };
    }
    if (deviation.owner !== session.user.email) {
      return { error: 'unauthorized' };
    }

    const correctiveActions = deviation.correctiveActions || [];
    if (
      correctiveActionIndex < 0 ||
      correctiveActionIndex >= correctiveActions.length
    ) {
      return { error: 'invalid index' };
    }

    correctiveActions[correctiveActionIndex].executedAt = new Date();

    const updateField: Partial<DeviationType> = {
      correctiveActions,
    };

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateField,
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not found' };
    }

    revalidateDeviationsAndDeviation();
    return { success: 'updated' };
  } catch (error) {
    console.error(error);
    return { error: 'confirmCorrectiveActionExecution server action error' };
  }
}

export async function redirectToDeviations() {
  redirect('/deviations');
}

export async function revalidateDeviationsAndDeviation() {
  revalidateTag('deviation');
  revalidateTag('deviations');
}

export async function sendReminderEmail(id: string) {
  const session = await auth();
  if (!session || !session.user.email) {
    return { error: 'unauthorized' };
  }
  try {
    const coll = await dbc('deviations');
    const deviation = await coll.findOne({ _id: new ObjectId(id) });
    if (!deviation) {
      return { error: 'not found' };
    }
    if (deviation.owner !== session.user.email) {
      return { error: 'unauthorized' };
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      service: process.env.NODEMAILER_SERVICE,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    // Define email options
    const mailOptions = {
      from: `"Odchylenia (Next BRUSS)" <${process.env.NODEMAILER_MAIL}>`,
      to: deviation.owner, //TODO: change to the proper emails - managers who should take action - group leader, quality manager, engineering manager, maintenance manager, production manager (if they haven’t approved yet)
      subject: 'Prośba o działanie',
      html: `${extractFullNameFromEmail(session.user.email)} prosi o podjęcie działania w sprawie odchylenia: <a href="${process.env.URL}/deviations/${id}">kliknij aby otworzyć</a>.`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return { success: 'sent' };
  } catch (error) {
    console.error(error);
    return { error: 'sendReminderEmail server action error' };
  }
}
