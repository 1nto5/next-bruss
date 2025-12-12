'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Package,
  Pencil,
  Send,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  deletePurchaseRequest,
  finalApprovePurchaseRequest,
  markAsCompleted,
  markAsOrdered,
  markItemReceived,
  preApprovePurchaseRequest,
  rejectPurchaseRequest,
  submitPurchaseRequest,
} from '../actions';
import { Dictionary } from '../lib/dict';
import {
  PurchaseRequestItemType,
  PurchaseRequestStatus,
  PurchaseRequestType,
} from '../lib/types';
import ApproveDialog from './approve-dialog';
import RejectDialog from './reject-dialog';
import CommentsSection from './comments-section';

const statusColors: Record<PurchaseRequestStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  'pre-approved': 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  ordered: 'bg-blue-100 text-blue-800',
  received: 'bg-purple-100 text-purple-800',
  completed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

interface RequestDetailsProps {
  request: PurchaseRequestType & { items: PurchaseRequestItemType[] };
  dict: Dictionary;
  lang: string;
  session: Session | null;
}

export default function RequestDetails({
  request,
  dict,
  lang,
  session,
}: RequestDetailsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [preApproveOpen, setPreApproveOpen] = useState(false);
  const [finalApproveOpen, setFinalApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const isOwner = request.requestedBy === session?.user?.email;
  const isManager = session?.user?.roles?.includes('manager') || false;
  const isPlantManager = session?.user?.roles?.includes('plant-manager') || false;
  const isBuyer = session?.user?.roles?.includes('buyer') || false;
  const isAdmin = session?.user?.roles?.includes('admin') || false;

  const canEdit = ['draft', 'pending'].includes(request.status) && isOwner;
  const canDelete = request.status === 'draft' && isOwner;
  const canSubmit = request.status === 'draft' && isOwner;
  const canPreApprove =
    request.status === 'pending' &&
    (isAdmin || (isManager && request.manager === session?.user?.email));
  const canFinalApprove =
    request.status === 'pre-approved' && (isPlantManager || isAdmin);
  const canReject =
    ['pending', 'pre-approved'].includes(request.status) &&
    (isManager || isPlantManager || isAdmin);
  const canMarkOrdered = request.status === 'approved' && (isBuyer || isAdmin);
  const canReceiveItems = request.status === 'ordered' && isOwner;
  const canComplete = request.status === 'received' && (isOwner || isAdmin);

  async function handleSubmit() {
    setIsLoading(true);
    const result = await submitPurchaseRequest(request._id);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.toast.submitted);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm('Na pewno usunąć?')) return;

    setIsLoading(true);
    const result = await deletePurchaseRequest(request._id);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.toast.deleted);
    router.push(`/${lang}/purchase-requests`);
  }

  async function handlePreApprove(comment: string) {
    setIsLoading(true);
    const result = await preApprovePurchaseRequest(request._id, comment);
    setIsLoading(false);
    setPreApproveOpen(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.preApproveDialog.toast.success);
    router.refresh();
  }

  async function handleFinalApprove(comment: string) {
    setIsLoading(true);
    const result = await finalApprovePurchaseRequest(request._id, comment);
    setIsLoading(false);
    setFinalApproveOpen(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.finalApproveDialog.toast.success);
    router.refresh();
  }

  async function handleReject(reason: string) {
    setIsLoading(true);
    const result = await rejectPurchaseRequest(request._id, reason);
    setIsLoading(false);
    setRejectOpen(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.rejectDialog.toast.success);
    router.refresh();
  }

  async function handleMarkOrdered() {
    setIsLoading(true);
    const result = await markAsOrdered(request._id);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.markOrderedDialog.toast.success);
    router.refresh();
  }

  async function handleReceiveItem(itemId: string) {
    setIsLoading(true);
    const result = await markItemReceived(itemId);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success('Pozycja odebrana');
    router.refresh();
  }

  async function handleComplete() {
    setIsLoading(true);
    const result = await markAsCompleted(request._id);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success('Zapotrzebowanie zakończone');
    router.refresh();
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild>
            <Link href={`/${lang}/purchase-requests`}>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>
              {request.internalId || dict.details.draft}
            </h1>
            <Badge className={statusColors[request.status]}>
              {dict.tableColumns.statuses[request.status]}
            </Badge>
          </div>
        </div>

        <div className='flex gap-2'>
          {canEdit && (
            <Button variant='outline' asChild>
              <Link href={`/${lang}/purchase-requests/${request._id}/edit`}>
                <Pencil className='mr-2 h-4 w-4' />
                {dict.common.edit}
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button
              variant='destructive'
              disabled={isLoading}
              onClick={handleDelete}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              {dict.common.delete}
            </Button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{dict.details.info}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.form.supplier}
              </dt>
              <dd className='font-medium'>{request.supplierName || '—'}</dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.form.currency}
              </dt>
              <dd className='font-medium'>{request.currency}</dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.tableColumns.total}
              </dt>
              <dd className='font-medium'>
                {request.total.toLocaleString('pl-PL', {
                  minimumFractionDigits: 2,
                })}{' '}
                {request.currency}
              </dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.tableColumns.requestedBy}
              </dt>
              <dd className='font-medium'>
                {extractNameFromEmail(request.requestedBy)}
              </dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.tableColumns.requestedAt}
              </dt>
              <dd className='font-medium'>
                {request.requestedAt
                  ? new Date(request.requestedAt).toLocaleDateString('pl-PL')
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.form.manager}
              </dt>
              <dd className='font-medium'>
                {extractNameFromEmail(request.manager)}
              </dd>
            </div>

            {request.preApprovedBy && (
              <>
                <div>
                  <dt className='text-sm text-muted-foreground'>
                    {dict.details.preApprovedBy}
                  </dt>
                  <dd className='font-medium'>
                    {extractNameFromEmail(request.preApprovedBy)}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm text-muted-foreground'>
                    {dict.details.preApprovedAt}
                  </dt>
                  <dd className='font-medium'>
                    {request.preApprovedAt
                      ? new Date(request.preApprovedAt).toLocaleDateString(
                          'pl-PL',
                        )
                      : '—'}
                  </dd>
                </div>
              </>
            )}

            {request.approvedBy && (
              <>
                <div>
                  <dt className='text-sm text-muted-foreground'>
                    {dict.details.approvedBy}
                  </dt>
                  <dd className='font-medium'>
                    {extractNameFromEmail(request.approvedBy)}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm text-muted-foreground'>
                    {dict.details.approvedAt}
                  </dt>
                  <dd className='font-medium'>
                    {request.approvedAt
                      ? new Date(request.approvedAt).toLocaleDateString('pl-PL')
                      : '—'}
                  </dd>
                </div>
              </>
            )}

            {request.rejectedBy && (
              <>
                <div className='sm:col-span-2 lg:col-span-3'>
                  <dt className='text-sm text-muted-foreground'>
                    {dict.details.rejectionReason}
                  </dt>
                  <dd className='mt-1 rounded bg-red-50 p-3 text-red-700'>
                    {request.rejectionReason}
                    <span className='ml-2 text-sm text-red-500'>
                      ({extractNameFromEmail(request.rejectedBy)},{' '}
                      {request.rejectedAt
                        ? new Date(request.rejectedAt).toLocaleDateString(
                            'pl-PL',
                          )
                        : ''}
                      )
                    </span>
                  </dd>
                </div>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>{dict.form.items}</CardTitle>
          <CardDescription>
            {request.itemCount} {request.itemCount === 1 ? 'pozycja' : 'pozycji'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.itemForm.description}</TableHead>
                  <TableHead className='w-[100px]'>
                    {dict.itemForm.quantity}
                  </TableHead>
                  <TableHead className='w-[120px]'>
                    {dict.itemForm.unitPrice}
                  </TableHead>
                  <TableHead className='w-[120px]'>Wartość</TableHead>
                  <TableHead>{dict.itemForm.reason}</TableHead>
                  {canReceiveItems && (
                    <TableHead className='w-[100px]'>Odbiór</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.items?.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div>
                        <p className='font-medium'>{item.description}</p>
                        {item.link && (
                          <a
                            href={item.link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-sm text-blue-600 hover:underline'
                          >
                            Link
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.unitPrice.toLocaleString('pl-PL', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className='font-medium'>
                      {(item.quantity * item.unitPrice).toLocaleString('pl-PL', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{item.reason || '—'}</TableCell>
                    {canReceiveItems && (
                      <TableCell>
                        {item.received ? (
                          <Badge variant='outline' className='bg-green-50'>
                            <Check className='mr-1 h-3 w-3' />
                            Odebrano
                          </Badge>
                        ) : (
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={isLoading}
                            onClick={() => handleReceiveItem(item._id)}
                          >
                            <Package className='mr-1 h-3 w-3' />
                            Odbierz
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className='mt-4 flex justify-end'>
            <div className='text-lg font-semibold'>
              Suma:{' '}
              {request.total.toLocaleString('pl-PL', {
                minimumFractionDigits: 2,
              })}{' '}
              {request.currency}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {(canSubmit ||
        canPreApprove ||
        canFinalApprove ||
        canReject ||
        canMarkOrdered ||
        canComplete) && (
        <Card>
          <CardHeader>
            <CardTitle>{dict.details.actions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {canSubmit && (
                <Button disabled={isLoading} onClick={handleSubmit}>
                  <Send className='mr-2 h-4 w-4' />
                  {dict.form.submit}
                </Button>
              )}
              {canPreApprove && (
                <Button
                  variant='outline'
                  disabled={isLoading}
                  onClick={() => setPreApproveOpen(true)}
                >
                  <Check className='mr-2 h-4 w-4' />
                  {dict.preApproveDialog.action}
                </Button>
              )}
              {canFinalApprove && (
                <Button disabled={isLoading} onClick={() => setFinalApproveOpen(true)}>
                  <CheckCheck className='mr-2 h-4 w-4' />
                  {dict.finalApproveDialog.action}
                </Button>
              )}
              {canReject && (
                <Button
                  variant='destructive'
                  disabled={isLoading}
                  onClick={() => setRejectOpen(true)}
                >
                  <X className='mr-2 h-4 w-4' />
                  {dict.rejectDialog.action}
                </Button>
              )}
              {canMarkOrdered && (
                <Button disabled={isLoading} onClick={handleMarkOrdered}>
                  <ShoppingCart className='mr-2 h-4 w-4' />
                  {dict.markOrderedDialog.action}
                </Button>
              )}
              {canComplete && (
                <Button disabled={isLoading} onClick={handleComplete}>
                  <CheckCheck className='mr-2 h-4 w-4' />
                  Zakończ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <CommentsSection
        requestId={request._id}
        comments={request.comments || []}
        dict={dict}
      />

      {/* Dialogs */}
      <ApproveDialog
        open={preApproveOpen}
        onOpenChange={setPreApproveOpen}
        onConfirm={handlePreApprove}
        title={dict.preApproveDialog.title}
        description={dict.preApproveDialog.description}
        actionLabel={dict.preApproveDialog.action}
        isLoading={isLoading}
      />

      <ApproveDialog
        open={finalApproveOpen}
        onOpenChange={setFinalApproveOpen}
        onConfirm={handleFinalApprove}
        title={dict.finalApproveDialog.title}
        description={dict.finalApproveDialog.description}
        actionLabel={dict.finalApproveDialog.action}
        isLoading={isLoading}
      />

      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
        dict={dict}
        isLoading={isLoading}
      />
    </div>
  );
}
