'use server';

import { auth } from '@/lib/auth';
import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CreatePurchaseRequestItemInput,
  PurchaseApproverType,
  PurchaseRequestStatus,
} from './lib/types';

// Helper to generate internal ID (PR-N/YY format)
async function generateInternalId(): Promise<string> {
  const coll = await dbc('purchase_requests');
  const year = new Date().getFullYear().toString().slice(-2);

  // Find highest number for this year
  const latest = await coll
    .find({ internalId: { $regex: `^PR-\\d+/${year}$` } })
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

  let nextNumber = 1;
  if (latest.length > 0 && latest[0].internalId) {
    const match = latest[0].internalId.match(/PR-(\d+)\//);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `PR-${nextNumber}/${year}`;
}

// Helper to calculate total from items
function calculateTotal(
  items: { quantity: number; unitPrice: number }[],
): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

// ============================================================================
// CREATE PURCHASE REQUEST
// ============================================================================

export async function createPurchaseRequest(data: {
  supplier?: string;
  supplierName?: string;
  currency: 'EUR' | 'GBP' | 'USD' | 'PLN';
  manager: string;
  items: CreatePurchaseRequestItemInput[];
  isDraft?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/auth');
  }

  try {
    const requestsColl = await dbc('purchase_requests');
    const itemsColl = await dbc('purchase_request_items');

    const total = calculateTotal(data.items);
    const status: PurchaseRequestStatus = data.isDraft ? 'draft' : 'pending';
    const internalId = data.isDraft ? undefined : await generateInternalId();

    // Create the request
    const requestDoc = {
      internalId,
      status,
      supplier: data.supplier || '',
      supplierName: data.supplierName || '',
      currency: data.currency,
      total,
      itemCount: data.items.length,
      requestedBy: session.user.email,
      requestedAt: new Date(),
      manager: data.manager,
      attachments: [],
      comments: [],
    };

    const result = await requestsColl.insertOne(requestDoc);
    const requestId = result.insertedId.toString();

    // Create items
    const itemDocs = data.items.map((item) => ({
      requestId,
      article: item.article || '',
      supplier: item.supplier || '',
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      currency: item.currency,
      euroRate: item.euroRate || 1,
      link: item.link || '',
      reason: item.reason || '',
      expectedDeliveryDate: item.expectedDeliveryDate || null,
      toolNumber: item.toolNumber || '',
      isEstimate: item.isEstimate || false,
      received: false,
    }));

    if (itemDocs.length > 0) {
      await itemsColl.insertMany(itemDocs);
    }

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'created', id: requestId };
  } catch (error) {
    console.error('createPurchaseRequest error:', error);
    return { error: 'create-failed' };
  }
}

// ============================================================================
// UPDATE PURCHASE REQUEST
// ============================================================================

export async function updatePurchaseRequest(
  id: string,
  data: {
    supplier?: string;
    supplierName?: string;
    currency?: 'EUR' | 'GBP' | 'USD' | 'PLN';
    manager?: string;
    items?: CreatePurchaseRequestItemInput[];
  },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const requestsColl = await dbc('purchase_requests');
    const itemsColl = await dbc('purchase_request_items');

    const request = await requestsColl.findOne({ _id: new ObjectId(id) });
    if (!request) {
      return { error: 'not-found' };
    }

    // Only allow editing drafts or own pending requests
    if (
      request.status !== 'draft' &&
      request.status !== 'pending' &&
      request.requestedBy !== session.user.email
    ) {
      return { error: 'cannot-edit' };
    }

    const updateData: any = {
      editedBy: session.user.email,
      editedAt: new Date(),
    };

    if (data.supplier !== undefined) updateData.supplier = data.supplier;
    if (data.supplierName !== undefined)
      updateData.supplierName = data.supplierName;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.manager !== undefined) updateData.manager = data.manager;

    // Update items if provided
    if (data.items) {
      // Delete existing items and insert new ones
      await itemsColl.deleteMany({ requestId: id });

      const itemDocs = data.items.map((item) => ({
        requestId: id,
        article: item.article || '',
        supplier: item.supplier || '',
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currency: item.currency,
        euroRate: item.euroRate || 1,
        link: item.link || '',
        reason: item.reason || '',
        expectedDeliveryDate: item.expectedDeliveryDate || null,
        toolNumber: item.toolNumber || '',
        isEstimate: item.isEstimate || false,
        received: false,
      }));

      if (itemDocs.length > 0) {
        await itemsColl.insertMany(itemDocs);
      }

      updateData.total = calculateTotal(data.items);
      updateData.itemCount = data.items.length;
    }

    await requestsColl.updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'updated' };
  } catch (error) {
    console.error('updatePurchaseRequest error:', error);
    return { error: 'update-failed' };
  }
}

// ============================================================================
// DELETE PURCHASE REQUEST (draft only)
// ============================================================================

export async function deletePurchaseRequest(id: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const requestsColl = await dbc('purchase_requests');
    const itemsColl = await dbc('purchase_request_items');

    const request = await requestsColl.findOne({ _id: new ObjectId(id) });
    if (!request) {
      return { error: 'not-found' };
    }

    // Only allow deleting own drafts
    if (
      request.status !== 'draft' ||
      request.requestedBy !== session.user.email
    ) {
      return { error: 'cannot-delete' };
    }

    await itemsColl.deleteMany({ requestId: id });
    await requestsColl.deleteOne({ _id: new ObjectId(id) });

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'deleted' };
  } catch (error) {
    console.error('deletePurchaseRequest error:', error);
    return { error: 'delete-failed' };
  }
}

// ============================================================================
// SUBMIT DRAFT (draft -> pending)
// ============================================================================

export async function submitPurchaseRequest(id: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const requestsColl = await dbc('purchase_requests');

    const request = await requestsColl.findOne({ _id: new ObjectId(id) });
    if (!request) {
      return { error: 'not-found' };
    }

    if (request.status !== 'draft') {
      return { error: 'not-draft' };
    }

    if (request.requestedBy !== session.user.email) {
      return { error: 'not-owner' };
    }

    const internalId = await generateInternalId();

    await requestsColl.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'pending',
          internalId,
          editedBy: session.user.email,
          editedAt: new Date(),
        },
      },
    );

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'submitted', internalId };
  } catch (error) {
    console.error('submitPurchaseRequest error:', error);
    return { error: 'submit-failed' };
  }
}

// ============================================================================
// PRE-APPROVE (pending -> pre-approved)
// ============================================================================

export async function preApprovePurchaseRequest(id: string, comment?: string) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles) {
    return { error: 'unauthorized' };
  }

  // Check if user is a manager or admin
  const hasRole =
    session.user.roles.includes('manager') ||
    session.user.roles.includes('admin');
  if (!hasRole) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const requestsColl = await dbc('purchase_requests');

    const request = await requestsColl.findOne({ _id: new ObjectId(id) });
    if (!request) {
      return { error: 'not-found' };
    }

    if (request.status !== 'pending') {
      return { error: 'invalid-status' };
    }

    // Check if user is assigned manager or admin
    if (
      request.manager !== session.user.email &&
      !session.user.roles.includes('admin')
    ) {
      return { error: 'not-assigned' };
    }

    // TODO: Check spending limits

    await requestsColl.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'pre-approved',
          preApprovedBy: session.user.email,
          preApprovedAt: new Date(),
          preApprovalComment: comment || '',
        },
      },
    );

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'pre-approved' };
  } catch (error) {
    console.error('preApprovePurchaseRequest error:', error);
    return { error: 'pre-approve-failed' };
  }
}

// ============================================================================
// FINAL APPROVE (pre-approved -> approved)
// ============================================================================

export async function finalApprovePurchaseRequest(id: string, comment?: string) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles) {
    return { error: 'unauthorized' };
  }

  // Check if user is plant-manager or admin
  const hasRole =
    session.user.roles.includes('plant-manager') ||
    session.user.roles.includes('admin');
  if (!hasRole) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const requestsColl = await dbc('purchase_requests');

    const request = await requestsColl.findOne({ _id: new ObjectId(id) });
    if (!request) {
      return { error: 'not-found' };
    }

    if (request.status !== 'pre-approved') {
      return { error: 'not-pre-approved' };
    }

    await requestsColl.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'approved',
          approvedBy: session.user.email,
          approvedAt: new Date(),
          approvalComment: comment || '',
        },
      },
    );

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'approved' };
  } catch (error) {
    console.error('finalApprovePurchaseRequest error:', error);
    return { error: 'approve-failed' };
  }
}

// ============================================================================
// REJECT (any approval stage -> rejected)
// ============================================================================

export async function rejectPurchaseRequest(id: string, reason: string) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles) {
    return { error: 'unauthorized' };
  }

  // Check if user has approval role
  const hasRole =
    session.user.roles.includes('manager') ||
    session.user.roles.includes('plant-manager') ||
    session.user.roles.includes('admin');
  if (!hasRole) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  if (!reason || reason.length < 10) {
    return { error: 'reason-required' };
  }

  try {
    const requestsColl = await dbc('purchase_requests');

    const request = await requestsColl.findOne({ _id: new ObjectId(id) });
    if (!request) {
      return { error: 'not-found' };
    }

    if (!['pending', 'pre-approved'].includes(request.status)) {
      return { error: 'invalid-status' };
    }

    await requestsColl.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'rejected',
          rejectedBy: session.user.email,
          rejectedAt: new Date(),
          rejectionReason: reason,
        },
      },
    );

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'rejected' };
  } catch (error) {
    console.error('rejectPurchaseRequest error:', error);
    return { error: 'reject-failed' };
  }
}

// ============================================================================
// MARK AS ORDERED (approved -> ordered)
// ============================================================================

export async function markAsOrdered(id: string, orderNumber?: string) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles) {
    return { error: 'unauthorized' };
  }

  // Check if user is buyer or admin
  const hasRole =
    session.user.roles.includes('buyer') ||
    session.user.roles.includes('admin');
  if (!hasRole) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const requestsColl = await dbc('purchase_requests');

    const request = await requestsColl.findOne({ _id: new ObjectId(id) });
    if (!request) {
      return { error: 'not-found' };
    }

    if (request.status !== 'approved') {
      return { error: 'not-approved' };
    }

    await requestsColl.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'ordered',
          orderNumber: orderNumber || '',
          orderedBy: session.user.email,
          orderedAt: new Date(),
        },
      },
    );

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'ordered' };
  } catch (error) {
    console.error('markAsOrdered error:', error);
    return { error: 'order-failed' };
  }
}

// ============================================================================
// MARK ITEM AS RECEIVED
// ============================================================================

export async function markItemReceived(itemId: string, quantity?: number) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(itemId)) {
    return { error: 'invalid-id' };
  }

  try {
    const itemsColl = await dbc('purchase_request_items');
    const requestsColl = await dbc('purchase_requests');

    const item = await itemsColl.findOne({ _id: new ObjectId(itemId) });
    if (!item) {
      return { error: 'not-found' };
    }

    // Get the parent request
    const request = await requestsColl.findOne({
      _id: new ObjectId(item.requestId),
    });
    if (!request) {
      return { error: 'request-not-found' };
    }

    // Only originator can mark as received
    if (request.requestedBy !== session.user.email) {
      return { error: 'not-originator' };
    }

    await itemsColl.updateOne(
      { _id: new ObjectId(itemId) },
      {
        $set: {
          received: true,
          receivedAt: new Date(),
          receivedBy: session.user.email,
          receivedQuantity: quantity || item.quantity,
        },
      },
    );

    // Check if all items are received
    const allItems = await itemsColl.find({ requestId: item.requestId }).toArray();
    const allReceived = allItems.every((i) =>
      i._id.toString() === itemId ? true : i.received,
    );

    if (allReceived) {
      await requestsColl.updateOne(
        { _id: new ObjectId(item.requestId) },
        {
          $set: {
            status: 'received',
            receivedAt: new Date(),
            receivedBy: session.user.email,
          },
        },
      );
    }

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'received', allReceived };
  } catch (error) {
    console.error('markItemReceived error:', error);
    return { error: 'receive-failed' };
  }
}

// ============================================================================
// MARK AS COMPLETED
// ============================================================================

export async function markAsCompleted(id: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const requestsColl = await dbc('purchase_requests');

    const request = await requestsColl.findOne({ _id: new ObjectId(id) });
    if (!request) {
      return { error: 'not-found' };
    }

    if (request.status !== 'received') {
      return { error: 'not-received' };
    }

    // Only originator or admin can complete
    const isAdmin = session.user.roles?.includes('admin');
    if (request.requestedBy !== session.user.email && !isAdmin) {
      return { error: 'unauthorized' };
    }

    await requestsColl.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'completed',
          completedBy: session.user.email,
          completedAt: new Date(),
        },
      },
    );

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'completed' };
  } catch (error) {
    console.error('markAsCompleted error:', error);
    return { error: 'complete-failed' };
  }
}

// ============================================================================
// ADD COMMENT
// ============================================================================

export async function addComment(id: string, content: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  if (!content || content.trim().length === 0) {
    return { error: 'content-required' };
  }

  try {
    const requestsColl = await dbc('purchase_requests');

    const result = await requestsColl.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          comments: {
            content: content.trim(),
            createdBy: session.user.email,
            createdAt: new Date(),
          },
        },
      } as any,
    );

    if (result.matchedCount === 0) {
      return { error: 'not-found' };
    }

    revalidateTag('purchase-requests', { expire: 0 });
    return { success: 'comment-added' };
  } catch (error) {
    console.error('addComment error:', error);
    return { error: 'comment-failed' };
  }
}

// ============================================================================
// APPROVER MANAGEMENT
// ============================================================================

export async function getApprovers(): Promise<{
  error?: string;
  success?: boolean;
  data?: PurchaseApproverType[];
}> {
  try {
    const coll = await dbc('purchase_approvers');
    const approvers = await coll.find({}).sort({ userId: 1 }).toArray();
    return {
      success: true,
      data: approvers.map((a) => ({
        _id: a._id.toString(),
        userId: a.userId || '',
        userName: a.userName,
        isFinalApprover: a.isFinalApprover || false,
        limits: a.limits || {},
        accumulated: a.accumulated || {},
        createdAt: a.createdAt,
        createdBy: a.createdBy || '',
        updatedAt: a.updatedAt,
        updatedBy: a.updatedBy,
      })),
    };
  } catch (error) {
    console.error('getApprovers error:', error);
    return { error: 'fetch-failed' };
  }
}

export async function addApprover(data: {
  userId: string;
  userName?: string;
  isFinalApprover: boolean;
  limits: {
    perUnit?: number;
    daily?: number;
    weekly?: number;
    monthly?: number;
    yearly?: number;
  };
}) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('purchase_approvers');

    // Check if already exists
    const existing = await coll.findOne({ userId: data.userId });
    if (existing) {
      return { error: 'already-exists' };
    }

    await coll.insertOne({
      userId: data.userId,
      userName: data.userName || '',
      isFinalApprover: data.isFinalApprover,
      limits: data.limits,
      accumulated: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
      },
      createdAt: new Date(),
      createdBy: session.user.email,
    });

    revalidateTag('purchase-approvers', { expire: 0 });
    return { success: 'created' };
  } catch (error) {
    console.error('addApprover error:', error);
    return { error: 'create-failed' };
  }
}

export async function updateApprover(
  userId: string,
  data: {
    userName?: string;
    isFinalApprover?: boolean;
    limits?: {
      perUnit?: number;
      daily?: number;
      weekly?: number;
      monthly?: number;
      yearly?: number;
    };
  },
) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('purchase_approvers');

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: session.user.email,
    };

    if (data.userName !== undefined) updateData.userName = data.userName;
    if (data.isFinalApprover !== undefined)
      updateData.isFinalApprover = data.isFinalApprover;
    if (data.limits !== undefined) updateData.limits = data.limits;

    const result = await coll.updateOne({ userId }, { $set: updateData });

    if (result.matchedCount === 0) {
      return { error: 'not-found' };
    }

    revalidateTag('purchase-approvers', { expire: 0 });
    return { success: 'updated' };
  } catch (error) {
    console.error('updateApprover error:', error);
    return { error: 'update-failed' };
  }
}

export async function deleteApprover(userId: string) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('purchase_approvers');
    const result = await coll.deleteOne({ userId });

    if (result.deletedCount === 0) {
      return { error: 'not-found' };
    }

    revalidateTag('purchase-approvers', { expire: 0 });
    return { success: 'deleted' };
  } catch (error) {
    console.error('deleteApprover error:', error);
    return { error: 'delete-failed' };
  }
}
