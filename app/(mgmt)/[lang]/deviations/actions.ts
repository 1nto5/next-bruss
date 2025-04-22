'use server';

import {
  ApprovalType,
  correctiveActionType,
  DeviationType,
} from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  AddCorrectiveActionType,
  AddDeviationDraftType,
  AddDeviationType,
} from './lib/zod';
// import { redirect } from 'next/navigation';

export async function revalidateDeviations() {
  revalidateTag('deviations');
}

export async function updateCorrectiveAction(
  id: string,
  correctiveAction: AddCorrectiveActionType,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    console.log(id);
    const deviationToUpdate = await collection.findOne({
      _id: new ObjectId(id),
    });
    if (!deviationToUpdate) {
      return { error: 'not found' };
    }
    if (session.user?.email !== deviationToUpdate.owner) {
      return { error: 'not authorized' };
    }

    const status = {
      value: 'open',
      executedAt: new Date(),
      changed: {
        at: new Date(),
        by: session.user?.email,
      },
    };

    const res = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          correctiveActions: [
            ...(deviationToUpdate.correctiveActions || []),
            {
              ...correctiveAction,
              created: {
                at: new Date(),
                by: session.user?.email,
              },
              status,
            },
          ],
        },
      },
    );

    if (res) {
      revalidateTag('deviation');
      return { success: 'updated' };
    } else {
      return { error: 'not updated' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'updateCorrectiveAction server action error' };
  }
}

export async function redirectToDeviation(id: string) {
  redirect(`/deviations/${id}`);
}

export async function revalidateReasons() {
  revalidateTag('deviationReasons');
}

export async function approveDeviation(id: string, userRole: string) {
  const session = await auth();
  if (
    !session ||
    !session.user?.email ||
    !(session.user?.roles ?? []).includes(userRole)
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
      by: session.user?.email,
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
  if (!session || !session.user?.email) {
    return { error: 'unauthorized' };
  }
  try {
    const coll = await dbc('deviations');
    const deviation = await coll.findOne({ _id: new ObjectId(id) });
    if (!deviation) {
      return { error: 'not found' };
    }
    if (deviation.owner !== session.user?.email) {
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

// export async function sendReminderEmail(id: string) {
//   const session = await auth();
//   if (!session || !session.user?.email) {
//     return { error: 'unauthorized' };
//   }
//   try {
//     const coll = await dbc('deviations');
//     const deviation = await coll.findOne({ _id: new ObjectId(id) });
//     if (!deviation) {
//       return { error: 'not found' };
//     }
//     if (deviation.owner !== session.user?.email) {
//       return { error: 'unauthorized' };
//     }

//     // Create a transporter
//     const transporter = nodemailer.createTransport({
//       host: process.env.NODEMAILER_HOST,
//       secure: false,
//       // service: process.env.NODEMAILER_SERVICE,
//       // auth: {
//       //   user: process.env.NODEMAILER_USER,
//       //   pass: process.env.NODEMAILER_PASS,
//       // },
//     });
//     transporter.verify(function (error, success) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log('Server is ready to take our messages');
//       }
//     });
//     console.log(deviation.owner);
//     // Define email options
//     const mailOptions = {
//       // from: `"Odchylenia (Next BRUSS)" <${process.env.NODEMAILER_MAIL}>`,
//       from: process.env.NODEMAILER_MAIL,
//       to: deviation.owner, //TODO: change to the proper emails - managers who should take action - group leader, quality manager, engineering manager, maintenance manager, production manager (if they haven’t approved yet)
//       subject: 'Prośba o działanie',
//       // html: `${extractFullNameFromEmail(session.user?.email)} prosi o podjęcie działania w sprawie odchylenia: <a href="${process.env.URL}/deviations/${id}">kliknij aby otworzyć</a>.`,
//     };

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     return { success: 'sent' };
//   } catch (error) {
//     console.error(error);
//     return { error: 'sendReminderEmail server action error' };
//   }
// }

export async function insertDeviation(deviation: AddDeviationType) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');

    const deviationToInsert: DeviationType = {
      status: 'approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
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
      owner: session.user?.email,
      correctiveActions: [],
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
    return { error: 'insertDeviation server action error' };
  }
}

export async function insertDraftDeviation(deviation: AddDeviationDraftType) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }

  try {
    const collection = await dbc('deviations');

    const deviationDraftToInsert: DeviationType = {
      status: 'draft',
      ...(deviation.articleName && { articleName: deviation.articleName }),
      ...(deviation.articleNumber && {
        articleNumber: deviation.articleNumber,
      }),
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
      ...(deviation.unit && { unit: deviation.unit }),
      ...(deviation.charge && { charge: deviation.charge }),
      ...(deviation.reason && { reason: deviation.reason }),
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
      owner: session.user?.email,
      correctiveActions: [],
    };

    const res = await collection.insertOne(deviationDraftToInsert);
    if (res) {
      revalidateTag('deviations');
      return { success: 'inserted' };
    } else {
      return { error: 'not inserted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'insertDraftDeviation server action error' };
  }
}

export async function findArticleName(articleNumber: string) {
  try {
    const collection = await dbc('inventory_articles');
    const res = await collection.findOne({ number: articleNumber });
    if (res) {
      return { success: res.name };
    } else {
      return { error: 'not found' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'findArticleName server action error' };
  }
}

export async function deleteDraftDeviation(id: string) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const res = await collection.deleteOne({
      _id: new ObjectId(id),
      owner: session.user?.email,
      status: 'draft',
    });
    if (res) {
      revalidateTag('deviations');
      return { success: 'deleted' };
    } else {
      return { error: 'not deleted' };
    }
  } catch (error) {
    console.error(error);
    return { error: 'deleteDraftDeviation server action error' };
  }
}

export async function updateDraftDeviation(
  id: string,
  deviation: AddDeviationDraftType,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const deviationToUpdate = await collection.findOne({
      _id: new ObjectId(id),
    });
    if (!deviationToUpdate) {
      return { error: 'not found' };
    }
    if (session.user?.email !== deviationToUpdate.owner) {
      return { error: 'not authorized' };
    }
    if (deviationToUpdate.status !== 'draft') {
      return { error: 'not draft' };
    }

    const updateData: Partial<DeviationType> = {
      status: 'draft',
      ...(deviation.articleName && { articleName: deviation.articleName }),
      ...(deviation.articleNumber && {
        articleNumber: deviation.articleNumber,
      }),
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
      ...(deviation.unit && { unit: deviation.unit }),
      ...(deviation.charge && { charge: deviation.charge }),
      ...(deviation.reason && { reason: deviation.reason }),
      timePeriod: { from: deviation.periodFrom, to: deviation.periodTo },
      ...(deviation.area && { area: deviation.area }),
      ...(deviation.description && { description: deviation.description }),
      ...(deviation.processSpecification && {
        processSpecification: deviation.processSpecification,
      }),

      customerAuthorization: deviation.customerAuthorization,
    };

    const res = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (res.matchedCount === 0) {
      return { error: 'not found' };
    }

    revalidateTag('deviations');
    return { success: 'updated' };
  } catch (error) {
    console.error(error);
    return { error: 'updateDraftDeviation server action error' };
  }
}

export async function insertDeviationFromDraft(
  id: string,
  deviation: AddDeviationType,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const draftDeviation = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!draftDeviation) {
      return { error: 'draft not found' };
    }

    if (session.user?.email !== draftDeviation.owner) {
      return { error: 'not authorized' };
    }

    if (draftDeviation.status !== 'draft') {
      return { error: 'source is not a draft' };
    }

    const deviationToInsert: DeviationType = {
      status: 'approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
      ...(deviation.drawingNumber && {
        drawingNumber: deviation.drawingNumber,
      }),
      ...(deviation.quantity && {
        quantity: {
          value: Number(deviation.quantity),
          unit: deviation.unit && deviation.unit,
        },
      }),
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
      owner: session.user?.email,
      correctiveActions: [],
    };

    const insertRes = await collection.insertOne(deviationToInsert);
    if (!insertRes.insertedId) {
      return { error: 'failed to insert new deviation' };
    }

    // Delete the draft after successful creation of the deviation
    const deleteRes = await collection.deleteOne({ _id: new ObjectId(id) });

    revalidateDeviationsAndDeviation();
    return { success: 'inserted' };
  } catch (error) {
    console.error(error);
    return { error: 'insertDeviationFromDraft server action error' };
  }
}
