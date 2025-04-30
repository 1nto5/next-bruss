'use server';

import {
  ApprovalHistoryType,
  ApprovalType,
  correctiveActionType,
  DeviationType,
  NotificationLogType, // Import NotificationLogType
} from '@/app/(mgmt)/[lang]/deviations/lib/types';
import { auth } from '@/auth';
import mailer from '@/lib/mailer'; // Import the mailer utility
import { dbc } from '@/lib/mongo';
import { Collection, ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  AddCorrectiveActionType,
  AddDeviationDraftType,
  AddDeviationType,
} from './lib/zod';
// import { redirect } from 'next/navigation';

// Define a simple user type for annotation
interface UserWithRoles {
  email: string;
  roles: string[];
  // Add other potential user fields if known, or use a more generic approach
  [key: string]: any;
}

// Define approval roles
const APPROVAL_ROLES = [
  'group-leader',
  'quality-manager',
  'production-manager',
  'plant-manager',
] as const;

// Polish translations for roles
const ROLE_TRANSLATIONS: { [key: string]: string } = {
  'group-leader': 'Group Leader',
  'quality-manager': 'Kierownik Jakości',
  'production-manager': 'Kierownik Produkcji',
  'plant-manager': 'Dyrektor Zakładu', // Updated translation
};

// --- Notification Helper Functions ---

async function sendGroupLeaderNotification(
  deviationId: ObjectId,
  internalId: string,
  deviationArea: string | undefined,
  notificationContext: 'creation' | 'edit', // Added context
  usersColl: Collection,
  deviationUrl: string,
): Promise<NotificationLogType[]> {
  const logs: NotificationLogType[] = [];
  const targetRole = deviationArea ? `group-leader-${deviationArea}` : null;
  let targetGroupLeaders: UserWithRoles[] = [];

  if (targetRole) {
    targetGroupLeaders = (await usersColl
      .find({ roles: { $all: ['group-leader', targetRole] } })
      .toArray()) as unknown as UserWithRoles[];
  }

  const uniqueEmails = Array.from(
    new Set(targetGroupLeaders.map((user) => user.email).filter(Boolean)),
  );

  if (uniqueEmails.length > 0) {
    const roleTranslated = ROLE_TRANSLATIONS['group-leader'];
    const actionText =
      notificationContext === 'creation' ? 'Utworzono nowe' : 'Zaktualizowano';
    const requirementText = 'zatwierdzenie';

    // Standardized subject
    const subject = `Odchylenie [${internalId}] - wymagane ${requirementText} (${roleTranslated})`;
    // Standardized HTML body
    const html = `
      <div style="font-family: sans-serif;">
        <p>${actionText} odchylenie [${internalId}] - wymagane ${requirementText} przez: ${roleTranslated}.</p>
        <p>Obszar: ${deviationArea?.toUpperCase() || 'Ogólny'}</p>
        <p>
          <a href="${deviationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Przejdź do odchylenia</a>
        </p>
      </div>`;

    for (const email of uniqueEmails) {
      try {
        await mailer({ to: email, subject, html });
        logs.push({
          to: email,
          sentAt: new Date(),
          type:
            notificationContext === 'creation'
              ? 'creation-group-leader'
              : 'edit-group-leader', // Context-based type
        });
      } catch (e) {
        console.error(`Failed GL mail to ${email}:`, e);
      }
    }
    console.log(
      `Sent GL notifications (${notificationContext}) for [${internalId}] to ${uniqueEmails.length} users.`,
    );
  } else {
    console.log(
      `No specific GL found for area ${deviationArea || 'N/A'} for [${internalId}].`,
    );
    // Return empty logs, handle notification to Plant Manager in handleNotifications
  }
  return logs;
}

// NEW function to notify Plant Manager about a specific vacant role
async function sendVacancyNotificationToPlantManager(
  deviationId: ObjectId,
  internalId: string,
  vacantRole: string, // The specific role that is vacant
  notificationContext: 'creation' | 'edit',
  usersColl: Collection,
  deviationUrl: string,
): Promise<NotificationLogType[]> {
  const logs: NotificationLogType[] = [];
  const plantManagers = (await usersColl
    .find({ roles: 'plant-manager' })
    .toArray()) as unknown as UserWithRoles[];
  const uniqueEmails = Array.from(
    new Set(plantManagers.map((user) => user.email).filter(Boolean)),
  );

  if (uniqueEmails.length > 0) {
    const actionText =
      notificationContext === 'creation' ? 'Utworzono nowe' : 'Zaktualizowano';
    const requirementText = 'zatwierdzenie';
    const vacantRoleTranslated = ROLE_TRANSLATIONS[vacantRole] || vacantRole;
    // Standardized subject for vacancy
    const subject = `Odchylenie [${internalId}] - wymagane ${requirementText} (wakat - ${vacantRoleTranslated})`;
    // Standardized HTML body for vacancy
    const html = `
        <div style="font-family: sans-serif;">
          <p>${actionText} odchylenie [${internalId}] - wymagane ${requirementText}.</p>
          <p style="color: red; font-weight: bold;">Powiadomienie wysłano do Dyrektora Zakładu z powodu wakatu na stanowisku: ${vacantRoleTranslated}.</p>
          <p>
            <a href="${deviationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Przejdź do odchylenia</a>
          </p>
        </div>`;

    for (const email of uniqueEmails) {
      try {
        await mailer({ to: email, subject, html });
        logs.push({
          to: email,
          sentAt: new Date(),
          type:
            notificationContext === 'creation'
              ? `vacant-role-${vacantRole}` // More specific type
              : `edit-vacant-role-${vacantRole}`,
        });
      } catch (e) {
        console.error(
          `Failed Vacancy (${vacantRole}) mail to Plant Manager ${email}:`,
          e,
        );
      }
    }
    console.log(
      `Sent Vacancy (${vacantRole}) notifications (${notificationContext}) for [${internalId}] to ${uniqueEmails.length} Plant Managers.`,
    );
  } else {
    console.error(
      `Vacancy detected for role (${vacantRole}) in [${internalId}], but no Plant Manager found!`,
    );
  }
  return logs;
}

async function sendNoGroupLeaderNotification(
  deviationId: ObjectId,
  internalId: string,
  deviationArea: string | undefined,
  notificationContext: 'creation' | 'edit', // Added context
  usersColl: Collection,
  deviationUrl: string,
): Promise<NotificationLogType[]> {
  const logs: NotificationLogType[] = [];
  // This function is only called if sendGroupLeaderNotification found no specific leader
  const plantManagers = (await usersColl
    .find({ roles: 'plant-manager' })
    .toArray()) as unknown as UserWithRoles[];
  const uniqueEmails = Array.from(
    new Set(plantManagers.map((user) => user.email).filter(Boolean)),
  );

  if (uniqueEmails.length > 0) {
    const actionText =
      notificationContext === 'creation' ? 'Utworzono nowe' : 'Zaktualizowano';
    const requirementText = 'zatwierdzenie';

    // Standardized subject for no GL
    const subject = `Odchylenie [${internalId}] - wymagane ${requirementText} (wakat Group Leader)`;
    // Standardized HTML body for no GL
    const html = `
      <div style="font-family: sans-serif;">
        <p>${actionText} odchylenie [${internalId}] w obszarze ${deviationArea?.toUpperCase()}, które wymaga ${requirementText}.</p>
        <p style="color: orange; font-weight: bold;">Powiadomienie wysłano do Dyrektora Zakładu z powodu braku przypisanego Group Leader dla obszaru ${deviationArea?.toUpperCase}.</p>
        <p>Proszę o podjęcie odpowiednich działań lub zapewnienie zastępstwa.</p>
        <p>
          <a href="${deviationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Przejdź do odchylenia</a>
        </p>
      </div>`;

    for (const email of uniqueEmails) {
      try {
        await mailer({ to: email, subject, html });
        logs.push({
          to: email,
          sentAt: new Date(),
          type:
            notificationContext === 'creation'
              ? 'no-group-leader'
              : 'edit-no-group-leader', // Context-based type
        });
      } catch (e) {
        console.error(`Failed No-GL mail to Plant Manager ${email}:`, e);
      }
    }
    console.log(
      `Sent No-GL notifications (${notificationContext}) for [${internalId}] to ${uniqueEmails.length} Plant Managers.`,
    );
  } else {
    console.error(
      `No GL found for area ${deviationArea || 'N/A'} in [${internalId}], and no Plant Manager found to notify!`,
    );
  }
  return logs;
}

// Ensure sendRoleNotification uses the standard body format
async function sendRoleNotification(
  deviationId: ObjectId,
  internalId: string,
  role: string, // Role to notify (e.g., 'quality-manager')
  notificationContext: 'creation' | 'edit',
  usersColl: Collection,
  deviationUrl: string,
): Promise<NotificationLogType[]> {
  const logs: NotificationLogType[] = [];
  const targetUsers = (await usersColl
    .find({ roles: role })
    .toArray()) as unknown as UserWithRoles[];

  const uniqueEmails = Array.from(
    new Set(targetUsers.map((user) => user.email).filter(Boolean)),
  );

  if (uniqueEmails.length > 0) {
    const roleTranslated = ROLE_TRANSLATIONS[role] || role; // Translate role name if available
    const actionText =
      notificationContext === 'creation' ? 'Utworzono nowe' : 'Zaktualizowano';
    const requirementText = 'zatwierdzenie';

    // Standardized subject
    const subject = `Odchylenie [${internalId}] - wymagane ${requirementText} (${roleTranslated})`;
    // Standardized HTML body
    const html = `
      <div style="font-family: sans-serif;">
        <p>${actionText} odchylenie [${internalId}] - wymagane ${requirementText} przez: ${roleTranslated}.</p>
        <p>
          <a href="${deviationUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Przejdź do odchylenia</a>
        </p>
      </div>`;

    for (const email of uniqueEmails) {
      try {
        await mailer({ to: email, subject, html });
        logs.push({
          to: email,
          sentAt: new Date(),
          type:
            notificationContext === 'creation'
              ? `creation-${role}`
              : `edit-${role}`, // Context-based type using role
        });
      } catch (e) {
        console.error(`Failed ${role} mail to ${email}:`, e);
      }
    }
    console.log(
      `Sent ${role} notifications (${notificationContext}) for [${internalId}] to ${uniqueEmails.length} users.`,
    );
  } else {
    console.log(`No users found with role ${role} for [${internalId}].`);
    // Return empty logs, handle vacancy notification in handleNotifications
  }
  return logs;
}

// Refactored handleNotifications logic
async function handleNotifications(
  deviation: DeviationType,
  deviationId: ObjectId,
  notificationContext: 'creation' | 'edit',
) {
  const allNotificationLogs: NotificationLogType[] = [];
  const deviationUrl = `${process.env.BASE_URL}/deviations/${deviationId.toString()}`;
  const internalId = deviation.internalId!; // Assume internalId exists

  try {
    const usersColl = await dbc('users');
    const deviationsColl = await dbc('deviations');

    // 1. Group Leader Notification (+ Fallback)
    const glLogs = await sendGroupLeaderNotification(
      deviationId,
      internalId,
      deviation.area,
      notificationContext,
      usersColl,
      deviationUrl,
    );
    allNotificationLogs.push(...glLogs);

    // If no specific GL found for the area, notify Plant Manager
    if (glLogs.length === 0 && deviation.area) {
      const noGlLogs = await sendNoGroupLeaderNotification(
        deviationId,
        internalId,
        deviation.area,
        notificationContext,
        usersColl,
        deviationUrl,
      );
      allNotificationLogs.push(...noGlLogs);
    }

    // 2. Quality Manager Notification (+ Vacancy Fallback)
    const qualityManagerExists = await usersColl.findOne({
      roles: 'quality-manager',
    });
    if (qualityManagerExists) {
      const qmLogs = await sendRoleNotification(
        deviationId,
        internalId,
        'quality-manager',
        notificationContext,
        usersColl,
        deviationUrl,
      );
      allNotificationLogs.push(...qmLogs);
    } else {
      console.log(
        `No Quality Manager found for [${internalId}], notifying Plant Manager.`,
      );
      const vacancyQmLogs = await sendVacancyNotificationToPlantManager(
        deviationId,
        internalId,
        'quality-manager', // Specify vacant role
        notificationContext,
        usersColl,
        deviationUrl,
      );
      allNotificationLogs.push(...vacancyQmLogs);
    }

    // 3. Production Manager Notification (+ Vacancy Fallback)
    const productionManagerExists = await usersColl.findOne({
      roles: 'production-manager',
    });
    if (productionManagerExists) {
      const pmLogs = await sendRoleNotification(
        deviationId,
        internalId,
        'production-manager',
        notificationContext,
        usersColl,
        deviationUrl,
      );
      allNotificationLogs.push(...pmLogs);
    } else {
      console.log(
        `No Production Manager found for [${internalId}], notifying Plant Manager.`,
      );
      const vacancyPmLogs = await sendVacancyNotificationToPlantManager(
        deviationId,
        internalId,
        'production-manager', // Specify vacant role
        notificationContext,
        usersColl,
        deviationUrl,
      );
      allNotificationLogs.push(...vacancyPmLogs);
    }

    // 4. Update Deviation with All Logs
    if (allNotificationLogs.length > 0) {
      try {
        const updateOperation =
          notificationContext === 'creation'
            ? { $set: { notificationLogs: allNotificationLogs } }
            : { $push: { notificationLogs: { $each: allNotificationLogs } } };

        await deviationsColl.updateOne({ _id: deviationId }, updateOperation);
        console.log(
          `Successfully updated notification logs for [${internalId}].`,
        );
      } catch (e) {
        console.error(`Failed to update logs for [${internalId}]:`, e);
      }
    }
  } catch (e) {
    console.error(`Error handling notifications for [${internalId}]:`, e);
  }
}

// --- End Notification Helper Functions ---

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

export async function approveDeviation(
  id: string,
  userRole: string,
  isApproved: boolean,
  comment?: string,
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return { error: 'unauthorized' };
  }

  const approvalFieldMap: { [key: string]: keyof DeviationType } = {
    'group-leader': 'groupLeaderApproval',
    'quality-manager': 'qualityManagerApproval',
    'production-manager': 'productionManagerApproval',
    'plant-manager': 'plantManagerApproval',
  };

  // Check if user has permission to approve as the specified role
  const hasDirectRole = (session.user?.roles ?? []).includes(userRole);
  const isPlantManager = (session.user?.roles ?? []).includes('plant-manager');
  const isProductionManager = (session.user?.roles ?? []).includes(
    'production-manager',
  );

  // Role elevation rules
  const canElevateToRole =
    (isPlantManager &&
      [
        'group-leader',
        'quality-manager',
        'production-manager',
        'plant-manager',
      ].includes(userRole)) ||
    (isProductionManager && userRole === 'group-leader');

  // If user doesn't have direct role or elevated permission, reject
  if (!hasDirectRole && !canElevateToRole) {
    return { error: 'unauthorized role' };
  }

  const approvalField = approvalFieldMap[userRole];
  if (!approvalField) {
    return { error: 'invalid role' };
  }

  try {
    const coll = await dbc('deviations');
    const deviation = await coll.findOne({ _id: new ObjectId(id) });
    if (!deviation) {
      return { error: 'not found' };
    }

    // Add validation for approval/rejection rules similar to UI:
    // 1. Prevent approving if already approved
    if (isApproved && deviation[approvalField]?.approved === true) {
      return { error: 'already approved' };
    }

    // 2. Only allow rejecting if not already decided (undefined)
    if (!isApproved && deviation[approvalField]?.approved !== undefined) {
      return { error: 'cannot reject after decision has been made' };
    }

    const currentApproval = deviation[approvalField] as
      | ApprovalType
      | undefined;
    const newApprovalRecord: ApprovalType = {
      approved: isApproved,
      by: session.user?.email,
      at: new Date(),
    };

    // Add comment for both approval and rejection
    if (comment) {
      newApprovalRecord.reason = comment;
    }

    // Prepare history records
    let history: ApprovalHistoryType[] = [];

    // Add the current approval to history if it exists
    if (currentApproval) {
      // If there's already history, preserve it
      if (currentApproval.history && currentApproval.history.length > 0) {
        history = [...currentApproval.history];
      }

      // Add the current approval state as a history item (excluding its own history)
      const { history: _, ...currentApprovalWithoutHistory } = currentApproval;
      history.unshift(currentApprovalWithoutHistory as ApprovalHistoryType);
    }

    // Set the history to the approval record
    newApprovalRecord.history = history;

    const updateField: Partial<DeviationType> = {
      [approvalField]: newApprovalRecord,
    };

    // If rejection, set status to rejected
    if (!isApproved) {
      updateField.status = 'rejected';
    } else {
      // Only check for all approvals if this is an approval (not rejection)
      const hasAllApprovals = Object.values(approvalFieldMap).every((field) =>
        field === approvalField ? true : deviation[field]?.approved,
      );

      if (hasAllApprovals) {
        const now = new Date();
        const periodFrom = new Date(deviation.timePeriod.from);
        const periodTo = new Date(deviation.timePeriod.to);

        updateField.status =
          now >= periodFrom && now <= periodTo ? 'in progress' : 'approved';
      }
    }

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
    return { success: isApproved ? 'approved' : 'rejected' };
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

// Helper function to generate the next internal ID
async function generateNextInternalId(): Promise<string> {
  try {
    const collection = await dbc('deviations');
    const currentYear = new Date().getFullYear();
    const shortYear = currentYear.toString().slice(-2); // Get last two digits of year

    // Find the highest internalId for the current short year
    const latestDeviation = await collection
      .find({ internalId: { $regex: `\/+${shortYear}$` } })
      .sort({ internalId: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 1;
    if (latestDeviation.length > 0 && latestDeviation[0].internalId) {
      const latestIdParts = latestDeviation[0].internalId.split('/');
      if (latestIdParts.length === 2) {
        nextNumber = parseInt(latestIdParts[0], 10) + 1;
      }
    }

    return `${nextNumber}/${shortYear}`;
  } catch (error) {
    console.error('Failed to generate internal ID:', error);
    // Fallback to a timestamp-based ID if there's an error
    return `${Date.now()}/${new Date().getFullYear().toString().slice(-2)}`;
  }
}

// Update insertDeviation to include internalId and email notification logging
export async function insertDeviation(deviation: AddDeviationType) {
  const session = await auth();
  if (!session || !session.user?.email) {
    redirect('/auth');
  }
  try {
    const collection = await dbc('deviations');
    const internalId = await generateNextInternalId();

    const deviationToInsert: DeviationType = {
      internalId,
      status: 'in approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
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
      notificationLogs: [], // Initialize notificationLogs
    };

    const res = await collection.insertOne(deviationToInsert);
    if (res.insertedId) {
      revalidateTag('deviations');

      // Call the centralized notification handler for creation
      await handleNotifications(deviationToInsert, res.insertedId, 'creation'); // Pass 'creation' context

      return { success: 'inserted', insertedId: res.insertedId.toString() };
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
    return { error: 'unauthorized' };
  }
  try {
    const collection = await dbc('deviations');
    const deviationToUpdate = await collection.findOne({
      _id: new ObjectId(id),
      owner: session.user?.email,
      status: 'draft',
    });

    if (!deviationToUpdate) {
      return { error: 'not found' };
    }

    const updateData: Partial<DeviationType> = {
      status: 'draft',
      edited: {
        at: new Date(),
        by: session.user?.email,
      },
      ...(deviation.articleName !== undefined && {
        articleName: deviation.articleName,
      }),
      ...(deviation.articleNumber !== undefined && {
        articleNumber: deviation.articleNumber,
      }),
      ...(deviation.customerNumber !== undefined && {
        customerNumber: deviation.customerNumber,
      }),
      ...(deviation.customerName !== undefined && {
        customerName: deviation.customerName,
      }),
      ...(deviation.workplace !== undefined && {
        workplace: deviation.workplace,
      }),
      quantity:
        deviation.quantity !== undefined
          ? {
              value: Number(deviation.quantity),
              unit: deviation.unit || deviationToUpdate.quantity?.unit || 'pcs',
            }
          : deviationToUpdate.quantity,
      ...(deviation.charge !== undefined && { charge: deviation.charge }),
      ...(deviation.description !== undefined && {
        description: deviation.description,
      }),
      ...(deviation.reason !== undefined && { reason: deviation.reason }),
      timePeriod: {
        from: deviation.periodFrom,
        to: deviation.periodTo,
      },
      ...(deviation.area !== undefined && { area: deviation.area }),
      ...(deviation.processSpecification !== undefined && {
        processSpecification: deviation.processSpecification,
      }),
      customerAuthorization: deviation.customerAuthorization,
    };

    const res = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (res.matchedCount === 0) {
      return { error: 'not found during update' };
    }
    if (res.modifiedCount === 0) {
    }

    revalidateDeviationsAndDeviation();
    return { success: 'updated' };
  } catch (error) {
    console.error('updateDraftDeviation server action error:', error);
    return { error: 'updateDraftDeviation server action error' };
  }
}

// NEW function to update non-draft deviations
export async function updateDeviation(
  id: string,
  deviation: AddDeviationType, // Assuming payload is similar to creation
) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return { error: 'unauthorized' };
  }
  try {
    const collection = await dbc('deviations');
    const deviationObjectId = new ObjectId(id);
    const originalDeviation = await collection.findOne({
      _id: deviationObjectId,
    });

    if (!originalDeviation) {
      return { error: 'not found' };
    }

    // Ensure it's not a draft
    if (originalDeviation.status === 'draft') {
      return { error: 'cannot update draft using this function' };
    }

    // Authorization check (e.g., only owner can edit)
    if (session.user?.email !== originalDeviation.owner) {
      // Add more complex role checks if needed (e.g., admin, plant manager)
      return { error: 'not authorized' };
    }

    // Prepare update data using atomic operators
    const updateOperation: { $set: Partial<DeviationType>; $unset?: any } = {
      $set: {
        // Update fields from the payload
        articleName: deviation.articleName,
        articleNumber: deviation.articleNumber,
        ...(deviation.workplace && { workplace: deviation.workplace }),
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
        ...(deviation.customerNumber && {
          customerNumber: deviation.customerNumber,
        }),
        customerAuthorization: deviation.customerAuthorization,
        // Add edited info
        edited: {
          at: new Date(),
          by: session.user?.email,
        },
        // Reset status
        status: 'in approval',
      },
      // Use $unset to remove approval fields entirely, ensuring they are re-evaluated
      $unset: {
        groupLeaderApproval: '',
        qualityManagerApproval: '',
        productionManagerApproval: '',
        plantManagerApproval: '',
      },
    };

    // Perform the update
    const res = await collection.updateOne(
      { _id: deviationObjectId },
      updateOperation, // Use the correctly structured update operation
    );

    if (res.matchedCount === 0) {
      return { error: 'not found during update' };
    }

    // Fetch the updated deviation to pass to notifications
    const updatedDeviation = await collection.findOne({
      _id: deviationObjectId,
    });

    if (updatedDeviation) {
      // Trigger notifications for the edit
      await handleNotifications(
        updatedDeviation as DeviationType,
        deviationObjectId,
        'edit',
      ); // Pass 'edit' context
    }

    revalidateDeviationsAndDeviation();
    return { success: 'updated' };
  } catch (error) {
    console.error('updateDeviation server action error:', error);
    return { error: 'updateDeviation server action error' };
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
    const draftDeviation = await collection.findOne({ _id: new ObjectId(id) });

    if (!draftDeviation) return { error: 'draft not found' };
    if (session.user?.email !== draftDeviation.owner)
      return { error: 'not authorized' };
    if (draftDeviation.status !== 'draft')
      return { error: 'source is not a draft' };

    const internalId = await generateNextInternalId();
    const deviationToInsert: DeviationType = {
      internalId,
      status: 'in approval',
      articleName: deviation.articleName,
      articleNumber: deviation.articleNumber,
      ...(deviation.workplace && { workplace: deviation.workplace }),
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
      createdAt: new Date(), // Use new creation date
      ...(deviation.customerNumber && {
        customerNumber: deviation.customerNumber,
      }),
      customerAuthorization: deviation.customerAuthorization,
      owner: session.user?.email,
      correctiveActions: [], // Start with empty corrective actions
      notificationLogs: [], // Initialize notificationLogs
    };

    const insertRes = await collection.insertOne(deviationToInsert);
    if (!insertRes.insertedId) {
      return { error: 'failed to insert new deviation' };
    }

    // Delete the original draft
    await collection.deleteOne({ _id: new ObjectId(id) });

    revalidateDeviationsAndDeviation();
    return { success: 'inserted', insertedId: insertRes.insertedId.toString() };
  } catch (error) {
    console.error(error);
    return { error: 'insertDeviationFromDraft server action error' };
  }
}
