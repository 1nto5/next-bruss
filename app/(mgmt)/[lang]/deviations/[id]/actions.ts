'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import {
  ApprovalType,
  correctiveActionType,
  DeviationType,
} from '@/lib/types/deviation';
import { extractFullNameFromEmail } from '@/lib/utils/nameFormat';
// import { AddDeviationType } from '@/lib/z/deviation';
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

export async function changeCorrectiveActionStatus(
  id: string,
  index: number,
  status: correctiveActionType['status'],
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
    if (index < 0 || index >= correctiveActions.length) {
      return { error: 'invalid index' };
    }
    const currentStatus = correctiveActions[index].status;
    const history = correctiveActions[index].history || [];

    history.unshift(currentStatus);

    const update = await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          [`correctiveActions.${index}.status`]: status,
          [`correctiveActions.${index}.history`]: history,
        },
      },
    );

    if (update.matchedCount === 0) {
      return { error: 'not updated' };
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

export async function revalidateDeviation() {
  revalidateTag('deviation');
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
      secure: false,
      // service: process.env.NODEMAILER_SERVICE,
      // auth: {
      //   user: process.env.NODEMAILER_USER,
      //   pass: process.env.NODEMAILER_PASS,
      // },
    });
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });
    console.log(deviation.owner);
    // Define email options
    const mailOptions = {
      // from: `"Odchylenia (Next BRUSS)" <${process.env.NODEMAILER_MAIL}>`,
      from: process.env.NODEMAILER_MAIL,
      to: deviation.owner, //TODO: change to the proper emails - managers who should take action - group leader, quality manager, engineering manager, maintenance manager, production manager (if they haven’t approved yet)
      subject: 'Prośba o działanie',
      // html: `${extractFullNameFromEmail(session.user.email)} prosi o podjęcie działania w sprawie odchylenia: <a href="${process.env.URL}/deviations/${id}">kliknij aby otworzyć</a>.`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return { success: 'sent' };
  } catch (error) {
    console.error(error);
    return { error: 'sendReminderEmail server action error' };
  }
}
