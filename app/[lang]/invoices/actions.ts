'use server';

import { auth } from '@/lib/auth';
import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  InvoiceStatus,
  PRLookupResult,
  SupplierCodeType,
  UploadInvoiceInput,
} from './lib/types';

// ============================================================================
// UPLOAD (CREATE) INVOICE
// ============================================================================

export async function uploadInvoice(data: UploadInvoiceInput) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/auth');
  }

  // Only bookkeeper or admin can upload
  const hasRole =
    session.user.roles?.includes('bookkeeper') ||
    session.user.roles?.includes('admin');
  if (!hasRole) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('invoices');

    const invoiceDoc = {
      invoiceNumber: data.invoiceNumber,
      status: 'to-confirm' as InvoiceStatus,
      supplier: data.supplier || '',
      supplierName: data.supplierName || '',
      value: data.value,
      currency: data.currency,
      sender: session.user.email,
      senderName: '',
      receiver: data.receiver,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : null,
      receiveDate: data.receiveDate ? new Date(data.receiveDate) : null,
      addedAt: new Date(),
      shortDescription: data.shortDescription || '',
      logs: [
        {
          action: 'created',
          user: session.user.email,
          timestamp: new Date(),
        },
      ],
    };

    const result = await coll.insertOne(invoiceDoc);

    revalidateTag('invoices', { expire: 0 });
    return { success: 'created', id: result.insertedId.toString() };
  } catch (error) {
    console.error('uploadInvoice error:', error);
    return { error: 'create-failed' };
  }
}

// ============================================================================
// UPDATE INVOICE
// ============================================================================

export async function updateInvoice(
  id: string,
  data: Partial<UploadInvoiceInput>,
) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const coll = await dbc('invoices');

    const invoice = await coll.findOne({ _id: new ObjectId(id) });
    if (!invoice) {
      return { error: 'not-found' };
    }

    // Only editable in to-confirm status
    if (invoice.status !== 'to-confirm') {
      return { error: 'cannot-edit' };
    }

    // Only sender or admin can edit
    const isAdmin = session.user.roles?.includes('admin');
    if (invoice.sender !== session.user.email && !isAdmin) {
      return { error: 'unauthorized' };
    }

    const updateData: Record<string, unknown> = {
      editedBy: session.user.email,
      editedAt: new Date(),
    };

    if (data.invoiceNumber !== undefined)
      updateData.invoiceNumber = data.invoiceNumber;
    if (data.supplier !== undefined) updateData.supplier = data.supplier;
    if (data.supplierName !== undefined)
      updateData.supplierName = data.supplierName;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.receiver !== undefined) updateData.receiver = data.receiver;
    if (data.invoiceDate !== undefined)
      updateData.invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : null;
    if (data.receiveDate !== undefined)
      updateData.receiveDate = data.receiveDate ? new Date(data.receiveDate) : null;
    if (data.shortDescription !== undefined)
      updateData.shortDescription = data.shortDescription;

    await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateData,
        $push: {
          logs: {
            action: 'updated',
            user: session.user.email,
            timestamp: new Date(),
          },
        },
      } as any,
    );

    revalidateTag('invoices', { expire: 0 });
    return { success: 'updated' };
  } catch (error) {
    console.error('updateInvoice error:', error);
    return { error: 'update-failed' };
  }
}

// ============================================================================
// DELETE INVOICE (to-confirm only)
// ============================================================================

export async function deleteInvoice(id: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const coll = await dbc('invoices');

    const invoice = await coll.findOne({ _id: new ObjectId(id) });
    if (!invoice) {
      return { error: 'not-found' };
    }

    if (invoice.status !== 'to-confirm') {
      return { error: 'cannot-delete' };
    }

    const isAdmin = session.user.roles?.includes('admin');
    if (invoice.sender !== session.user.email && !isAdmin) {
      return { error: 'unauthorized' };
    }

    await coll.deleteOne({ _id: new ObjectId(id) });

    revalidateTag('invoices', { expire: 0 });
    return { success: 'deleted' };
  } catch (error) {
    console.error('deleteInvoice error:', error);
    return { error: 'delete-failed' };
  }
}

// ============================================================================
// CONFIRM WITH PR (to-confirm -> confirmed)
// ============================================================================

export async function confirmWithPR(id: string, prId: string, comment?: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id) || !ObjectId.isValid(prId)) {
    return { error: 'invalid-id' };
  }

  try {
    const invoicesColl = await dbc('invoices');
    const prColl = await dbc('purchase_requests');

    const invoice = await invoicesColl.findOne({ _id: new ObjectId(id) });
    if (!invoice) {
      return { error: 'not-found' };
    }

    if (invoice.status !== 'to-confirm') {
      return { error: 'invalid-status' };
    }

    // Only receiver can confirm
    if (invoice.receiver !== session.user.email) {
      return { error: 'not-receiver' };
    }

    // Get the PR
    const pr = await prColl.findOne({ _id: new ObjectId(prId) });
    if (!pr) {
      return { error: 'pr-not-found' };
    }

    // PR must be approved or ordered
    if (!['approved', 'ordered', 'received', 'completed'].includes(pr.status)) {
      return { error: 'pr-not-approved' };
    }

    // Check if value matches (allow 10% tolerance)
    const tolerance = pr.total * 0.1;
    const valueDiff = Math.abs(invoice.value - pr.total);
    const requiresReview = valueDiff > tolerance;

    if (requiresReview) {
      // Send to manager review
      await invoicesColl.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: 'manager-review',
            confirmationType: 'pr',
            linkedPrId: prId,
            linkedPrNumber: pr.internalId,
            managerReviewReason: `Value mismatch: Invoice ${invoice.value} ${invoice.currency} vs PR ${pr.total} ${pr.currency}`,
          },
          $push: {
            logs: {
              action: 'sent-to-review',
              user: session.user.email,
              timestamp: new Date(),
              comment: comment || `PR: ${pr.internalId}`,
            },
          },
        } as any,
      );

      revalidateTag('invoices', { expire: 0 });
      return { success: 'sent-to-review' };
    }

    // Confirm directly
    await invoicesColl.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'confirmed',
          confirmationType: 'pr',
          linkedPrId: prId,
          linkedPrNumber: pr.internalId,
          confirmedBy: session.user.email,
          confirmedAt: new Date(),
        },
        $push: {
          logs: {
            action: 'confirmed-with-pr',
            user: session.user.email,
            timestamp: new Date(),
            comment: comment || `PR: ${pr.internalId}`,
          },
        },
      } as any,
    );

    revalidateTag('invoices', { expire: 0 });
    return { success: 'confirmed' };
  } catch (error) {
    console.error('confirmWithPR error:', error);
    return { error: 'confirm-failed' };
  }
}

// ============================================================================
// CONFIRM WITH SC (to-confirm -> confirmed)
// ============================================================================

export async function confirmWithSC(id: string, scCode: string, comment?: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const invoicesColl = await dbc('invoices');
    const scColl = await dbc('supplier_codes');

    const invoice = await invoicesColl.findOne({ _id: new ObjectId(id) });
    if (!invoice) {
      return { error: 'not-found' };
    }

    if (invoice.status !== 'to-confirm') {
      return { error: 'invalid-status' };
    }

    // Only receiver can confirm
    if (invoice.receiver !== session.user.email) {
      return { error: 'not-receiver' };
    }

    // Get the SC
    const sc = await scColl.findOne({ code: scCode, status: 'active' });
    if (!sc) {
      return { error: 'sc-not-found' };
    }

    // SC owner must match receiver
    if (sc.owner !== session.user.email) {
      return { error: 'not-sc-owner' };
    }

    // Check SC limit
    const requiresReview = sc.maxValue && invoice.value > sc.maxValue;

    if (requiresReview) {
      await invoicesColl.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: 'manager-review',
            confirmationType: 'sc',
            linkedScCode: scCode,
            managerReviewReason: `SC limit exceeded: Invoice ${invoice.value} ${invoice.currency} > SC limit ${sc.maxValue} ${sc.maxCurrency}`,
          },
          $push: {
            logs: {
              action: 'sent-to-review',
              user: session.user.email,
              timestamp: new Date(),
              comment: comment || `SC: ${scCode}`,
            },
          },
        } as any,
      );

      revalidateTag('invoices', { expire: 0 });
      return { success: 'sent-to-review' };
    }

    // Confirm directly
    await invoicesColl.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'confirmed',
          confirmationType: 'sc',
          linkedScCode: scCode,
          confirmedBy: session.user.email,
          confirmedAt: new Date(),
        },
        $push: {
          logs: {
            action: 'confirmed-with-sc',
            user: session.user.email,
            timestamp: new Date(),
            comment: comment || `SC: ${scCode}`,
          },
        },
      } as any,
    );

    revalidateTag('invoices', { expire: 0 });
    return { success: 'confirmed' };
  } catch (error) {
    console.error('confirmWithSC error:', error);
    return { error: 'confirm-failed' };
  }
}

// ============================================================================
// APPROVE MANAGER REVIEW (manager-review -> confirmed)
// ============================================================================

export async function approveManagerReview(id: string, comment?: string) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles) {
    return { error: 'unauthorized' };
  }

  // Only plant-manager or admin
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
    const coll = await dbc('invoices');

    const invoice = await coll.findOne({ _id: new ObjectId(id) });
    if (!invoice) {
      return { error: 'not-found' };
    }

    if (invoice.status !== 'manager-review') {
      return { error: 'invalid-status' };
    }

    await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'confirmed',
          reviewedBy: session.user.email,
          reviewedAt: new Date(),
          confirmedBy: session.user.email,
          confirmedAt: new Date(),
        },
        $push: {
          logs: {
            action: 'manager-approved',
            user: session.user.email,
            timestamp: new Date(),
            comment: comment || '',
          },
        },
      } as any,
    );

    revalidateTag('invoices', { expire: 0 });
    return { success: 'approved' };
  } catch (error) {
    console.error('approveManagerReview error:', error);
    return { error: 'approve-failed' };
  }
}

// ============================================================================
// REJECT INVOICE
// ============================================================================

export async function rejectInvoice(id: string, reason: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  if (!reason || reason.length < 10) {
    return { error: 'reason-required' };
  }

  try {
    const coll = await dbc('invoices');

    const invoice = await coll.findOne({ _id: new ObjectId(id) });
    if (!invoice) {
      return { error: 'not-found' };
    }

    // Can reject from to-confirm or manager-review
    if (!['to-confirm', 'manager-review'].includes(invoice.status)) {
      return { error: 'invalid-status' };
    }

    // Receiver, plant-manager, or admin can reject
    const canReject =
      invoice.receiver === session.user.email ||
      session.user.roles?.includes('plant-manager') ||
      session.user.roles?.includes('admin');

    if (!canReject) {
      return { error: 'unauthorized' };
    }

    await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'rejected',
          rejectedBy: session.user.email,
          rejectedAt: new Date(),
          rejectionReason: reason,
        },
        $push: {
          logs: {
            action: 'rejected',
            user: session.user.email,
            timestamp: new Date(),
            comment: reason,
          },
        },
      } as any,
    );

    revalidateTag('invoices', { expire: 0 });
    return { success: 'rejected' };
  } catch (error) {
    console.error('rejectInvoice error:', error);
    return { error: 'reject-failed' };
  }
}

// ============================================================================
// REOPEN INVOICE (rejected -> to-confirm)
// ============================================================================

export async function reopenInvoice(id: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const coll = await dbc('invoices');

    const invoice = await coll.findOne({ _id: new ObjectId(id) });
    if (!invoice) {
      return { error: 'not-found' };
    }

    if (invoice.status !== 'rejected') {
      return { error: 'not-rejected' };
    }

    // Only bookkeeper or admin can reopen
    const hasRole =
      session.user.roles?.includes('bookkeeper') ||
      session.user.roles?.includes('admin');
    if (!hasRole) {
      return { error: 'unauthorized' };
    }

    await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'to-confirm',
        },
        $unset: {
          rejectedBy: '',
          rejectedAt: '',
          rejectionReason: '',
          confirmationType: '',
          linkedPrId: '',
          linkedPrNumber: '',
          linkedScCode: '',
        },
        $push: {
          logs: {
            action: 'reopened',
            user: session.user.email,
            timestamp: new Date(),
          },
        },
      } as any,
    );

    revalidateTag('invoices', { expire: 0 });
    return { success: 'reopened' };
  } catch (error) {
    console.error('reopenInvoice error:', error);
    return { error: 'reopen-failed' };
  }
}

// ============================================================================
// MARK AS BOOKED (confirmed -> booked)
// ============================================================================

export async function markAsBooked(id: string, bookingReference?: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized' };
  }

  // Only bookkeeper or admin
  const hasRole =
    session.user.roles?.includes('bookkeeper') ||
    session.user.roles?.includes('admin');
  if (!hasRole) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const coll = await dbc('invoices');

    const invoice = await coll.findOne({ _id: new ObjectId(id) });
    if (!invoice) {
      return { error: 'not-found' };
    }

    if (invoice.status !== 'confirmed') {
      return { error: 'not-confirmed' };
    }

    await coll.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'booked',
          bookingReference: bookingReference || '',
          bookedBy: session.user.email,
          bookedAt: new Date(),
        },
        $push: {
          logs: {
            action: 'booked',
            user: session.user.email,
            timestamp: new Date(),
            comment: bookingReference || '',
          },
        },
      } as any,
    );

    revalidateTag('invoices', { expire: 0 });
    return { success: 'booked' };
  } catch (error) {
    console.error('markAsBooked error:', error);
    return { error: 'book-failed' };
  }
}

// ============================================================================
// GET AVAILABLE PRs FOR CONFIRMATION
// ============================================================================

export async function getAvailablePRs(supplierName?: string): Promise<{
  error?: string;
  success?: boolean;
  data: PRLookupResult[];
}> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized', data: [] };
  }

  try {
    const coll = await dbc('purchase_requests');

    const query: Record<string, unknown> = {
      status: { $in: ['approved', 'ordered', 'received'] },
    };

    if (supplierName) {
      query.supplierName = { $regex: supplierName, $options: 'i' };
    }

    const prs = await coll
      .find(query)
      .sort({ approvedAt: -1 })
      .limit(50)
      .project({
        _id: 1,
        internalId: 1,
        supplierName: 1,
        total: 1,
        currency: 1,
        status: 1,
        requestedBy: 1,
        approvedAt: 1,
      })
      .toArray();

    return {
      success: true,
      data: prs.map((pr) => ({
        _id: pr._id.toString(),
        internalId: pr.internalId || '',
        supplierName: pr.supplierName || '',
        total: pr.total || 0,
        currency: pr.currency || 'EUR',
        status: pr.status || '',
        requestedBy: pr.requestedBy || '',
        approvedAt: pr.approvedAt,
      })),
    };
  } catch (error) {
    console.error('getAvailablePRs error:', error);
    return { error: 'fetch-failed', data: [] };
  }
}

// ============================================================================
// SUPPLIER CODE MANAGEMENT
// ============================================================================

export async function getSupplierCodes(): Promise<{
  error?: string;
  success?: boolean;
  data: SupplierCodeType[];
}> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized', data: [] };
  }

  try {
    const coll = await dbc('supplier_codes');
    const codes = await coll.find({}).sort({ code: 1 }).toArray();
    return {
      success: true,
      data: codes.map((code) => ({
        _id: code._id.toString(),
        code: code.code || '',
        description: code.description || '',
        owner: code.owner || '',
        ownerName: code.ownerName,
        maxValue: code.maxValue,
        maxCurrency: code.maxCurrency,
        status: code.status || 'active',
        createdAt: code.createdAt,
        createdBy: code.createdBy || '',
        updatedAt: code.updatedAt,
        updatedBy: code.updatedBy,
      })),
    };
  } catch (error) {
    console.error('getSupplierCodes error:', error);
    return { error: 'fetch-failed', data: [] };
  }
}

export async function createSupplierCode(data: {
  code: string;
  description: string;
  owner: string;
  ownerName?: string;
  maxValue?: number;
  maxCurrency?: 'EUR' | 'GBP' | 'USD' | 'PLN';
}) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  try {
    const coll = await dbc('supplier_codes');

    // Check if code exists
    const existing = await coll.findOne({ code: data.code });
    if (existing) {
      return { error: 'code-exists' };
    }

    await coll.insertOne({
      code: data.code,
      description: data.description,
      owner: data.owner,
      ownerName: data.ownerName || '',
      maxValue: data.maxValue || null,
      maxCurrency: data.maxCurrency || 'EUR',
      status: 'active',
      createdAt: new Date(),
      createdBy: session.user.email,
    });

    revalidateTag('supplier-codes', { expire: 0 });
    return { success: 'created' };
  } catch (error) {
    console.error('createSupplierCode error:', error);
    return { error: 'create-failed' };
  }
}

export async function updateSupplierCode(
  id: string,
  data: {
    description?: string;
    owner?: string;
    ownerName?: string;
    maxValue?: number;
    maxCurrency?: 'EUR' | 'GBP' | 'USD' | 'PLN';
    status?: 'active' | 'inactive';
  },
) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const coll = await dbc('supplier_codes');

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: session.user.email,
    };

    if (data.description !== undefined) updateData.description = data.description;
    if (data.owner !== undefined) updateData.owner = data.owner;
    if (data.ownerName !== undefined) updateData.ownerName = data.ownerName;
    if (data.maxValue !== undefined) updateData.maxValue = data.maxValue;
    if (data.maxCurrency !== undefined) updateData.maxCurrency = data.maxCurrency;
    if (data.status !== undefined) updateData.status = data.status;

    const result = await coll.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return { error: 'not-found' };
    }

    revalidateTag('supplier-codes', { expire: 0 });
    return { success: 'updated' };
  } catch (error) {
    console.error('updateSupplierCode error:', error);
    return { error: 'update-failed' };
  }
}

export async function deleteSupplierCode(id: string) {
  const session = await auth();
  if (!session?.user?.email || !session?.user?.roles?.includes('admin')) {
    return { error: 'unauthorized' };
  }

  if (!ObjectId.isValid(id)) {
    return { error: 'invalid-id' };
  }

  try {
    const coll = await dbc('supplier_codes');
    const result = await coll.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return { error: 'not-found' };
    }

    revalidateTag('supplier-codes', { expire: 0 });
    return { success: 'deleted' };
  } catch (error) {
    console.error('deleteSupplierCode error:', error);
    return { error: 'delete-failed' };
  }
}

// ============================================================================
// GET USER'S SUPPLIER CODES (for confirmation)
// ============================================================================

export async function getMySupplierCodes(): Promise<{
  error?: string;
  success?: boolean;
  data: SupplierCodeType[];
}> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: 'unauthorized', data: [] };
  }

  try {
    const coll = await dbc('supplier_codes');
    const codes = await coll
      .find({ owner: session.user.email, status: 'active' })
      .sort({ code: 1 })
      .toArray();

    return {
      success: true,
      data: codes.map((code) => ({
        _id: code._id.toString(),
        code: code.code || '',
        description: code.description || '',
        owner: code.owner || '',
        ownerName: code.ownerName,
        maxValue: code.maxValue,
        maxCurrency: code.maxCurrency,
        status: code.status || 'active',
        createdAt: code.createdAt,
        createdBy: code.createdBy || '',
        updatedAt: code.updatedAt,
        updatedBy: code.updatedBy,
      })),
    };
  } catch (error) {
    console.error('getMySupplierCodes error:', error);
    return { error: 'fetch-failed', data: [] };
  }
}
