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
import { extractNameFromEmail } from '@/lib/utils/name-format';
import {
  ArrowLeft,
  BookOpen,
  Check,
  FileText,
  RefreshCcw,
  Trash2,
  X,
} from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  approveManagerReview,
  deleteInvoice,
  markAsBooked,
  rejectInvoice,
  reopenInvoice,
} from '../actions';
import { Dictionary } from '../lib/dict';
import { InvoiceStatus, InvoiceType, PRLookupResult, SupplierCodeType } from '../lib/types';
import ConfirmWithPRDialog from './confirm-with-pr-dialog';
import ConfirmWithSCDialog from './confirm-with-sc-dialog';
import RejectDialog from './reject-dialog';
import BookDialog from './book-dialog';

const statusColors: Record<InvoiceStatus, string> = {
  'to-confirm': 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  'manager-review': 'bg-orange-100 text-orange-800',
  booked: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
};

interface InvoiceDetailsProps {
  invoice: InvoiceType;
  dict: Dictionary;
  lang: string;
  session: Session | null;
  availablePRs: PRLookupResult[];
  mySupplierCodes: SupplierCodeType[];
}

export default function InvoiceDetails({
  invoice,
  dict,
  lang,
  session,
  availablePRs,
  mySupplierCodes,
}: InvoiceDetailsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prDialogOpen, setPrDialogOpen] = useState(false);
  const [scDialogOpen, setScDialogOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  const isReceiver = invoice.receiver === session?.user?.email;
  const isSender = invoice.sender === session?.user?.email;
  const isBookkeeper = session?.user?.roles?.includes('bookkeeper') || false;
  const isPlantManager = session?.user?.roles?.includes('plant-manager') || false;
  const isAdmin = session?.user?.roles?.includes('admin') || false;

  const canConfirm = invoice.status === 'to-confirm' && isReceiver;
  const canApproveReview =
    invoice.status === 'manager-review' && (isPlantManager || isAdmin);
  const canReject =
    ['to-confirm', 'manager-review'].includes(invoice.status) &&
    (isReceiver || isPlantManager || isAdmin);
  const canBook = invoice.status === 'confirmed' && (isBookkeeper || isAdmin);
  const canReopen = invoice.status === 'rejected' && (isBookkeeper || isAdmin);
  const canDelete = invoice.status === 'to-confirm' && (isSender || isAdmin);

  async function handleDelete() {
    if (!confirm('Na pewno usunąć?')) return;

    setIsLoading(true);
    const result = await deleteInvoice(invoice._id);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.toast.deleted);
    router.push(`/${lang}/invoices`);
  }

  async function handleApproveReview() {
    setIsLoading(true);
    const result = await approveManagerReview(invoice._id);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.managerReviewDialog.success);
    router.refresh();
  }

  async function handleReject(reason: string) {
    setIsLoading(true);
    const result = await rejectInvoice(invoice._id, reason);
    setIsLoading(false);
    setRejectOpen(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.rejectDialog.success);
    router.refresh();
  }

  async function handleBook(reference: string) {
    setIsLoading(true);
    const result = await markAsBooked(invoice._id, reference);
    setIsLoading(false);
    setBookOpen(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.bookDialog.success);
    router.refresh();
  }

  async function handleReopen() {
    setIsLoading(true);
    const result = await reopenInvoice(invoice._id);
    setIsLoading(false);

    if (result.error) {
      toast.error(dict.toast.contactIT);
      return;
    }

    toast.success(dict.toast.reopened);
    router.refresh();
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild>
            <Link href={`/${lang}/invoices`}>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>{invoice.invoiceNumber}</h1>
            <Badge className={statusColors[invoice.status]}>
              {dict.tableColumns.statuses[invoice.status]}
            </Badge>
          </div>
        </div>

        <div className='flex gap-2'>
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
                {dict.form.supplierName}
              </dt>
              <dd className='font-medium'>{invoice.supplierName || '—'}</dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.tableColumns.value}
              </dt>
              <dd className='font-medium'>
                {invoice.value.toLocaleString('pl-PL', {
                  minimumFractionDigits: 2,
                })}{' '}
                {invoice.currency}
              </dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.tableColumns.receiver}
              </dt>
              <dd className='font-medium'>
                {extractNameFromEmail(invoice.receiver)}
              </dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.details.sender}
              </dt>
              <dd className='font-medium'>
                {extractNameFromEmail(invoice.sender)}
              </dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.form.invoiceDate}
              </dt>
              <dd className='font-medium'>
                {invoice.invoiceDate
                  ? new Date(invoice.invoiceDate).toLocaleDateString('pl-PL')
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className='text-sm text-muted-foreground'>
                {dict.form.receiveDate}
              </dt>
              <dd className='font-medium'>
                {invoice.receiveDate
                  ? new Date(invoice.receiveDate).toLocaleDateString('pl-PL')
                  : '—'}
              </dd>
            </div>

            {invoice.shortDescription && (
              <div className='sm:col-span-2 lg:col-span-3'>
                <dt className='text-sm text-muted-foreground'>
                  {dict.form.shortDescription}
                </dt>
                <dd className='font-medium'>{invoice.shortDescription}</dd>
              </div>
            )}

            {invoice.confirmationType && (
              <div>
                <dt className='text-sm text-muted-foreground'>
                  {dict.details.confirmedWith}
                </dt>
                <dd className='font-medium'>
                  {invoice.confirmationType === 'pr' && (
                    <Badge variant='outline'>
                      <FileText className='mr-1 h-3 w-3' />
                      PR: {invoice.linkedPrNumber}
                    </Badge>
                  )}
                  {invoice.confirmationType === 'sc' && (
                    <Badge variant='outline'>
                      SC: {invoice.linkedScCode}
                    </Badge>
                  )}
                </dd>
              </div>
            )}

            {invoice.bookingReference && (
              <div>
                <dt className='text-sm text-muted-foreground'>
                  {dict.details.bookingReference}
                </dt>
                <dd className='font-medium'>{invoice.bookingReference}</dd>
              </div>
            )}

            {invoice.rejectionReason && (
              <div className='sm:col-span-2 lg:col-span-3'>
                <dt className='text-sm text-muted-foreground'>
                  {dict.details.rejectionReason}
                </dt>
                <dd className='mt-1 rounded bg-red-50 p-3 text-red-700'>
                  {invoice.rejectionReason}
                  <span className='ml-2 text-sm text-red-500'>
                    ({extractNameFromEmail(invoice.rejectedBy || '')},{' '}
                    {invoice.rejectedAt
                      ? new Date(invoice.rejectedAt).toLocaleDateString('pl-PL')
                      : ''}
                    )
                  </span>
                </dd>
              </div>
            )}

            {invoice.managerReviewReason && (
              <div className='sm:col-span-2 lg:col-span-3'>
                <dt className='text-sm text-muted-foreground'>
                  {dict.details.reviewReason}
                </dt>
                <dd className='mt-1 rounded bg-orange-50 p-3 text-orange-700'>
                  {invoice.managerReviewReason}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {(canConfirm || canApproveReview || canReject || canBook || canReopen) && (
        <Card>
          <CardHeader>
            <CardTitle>{dict.details.actions}</CardTitle>
            <CardDescription>
              {canConfirm && dict.details.confirmDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {canConfirm && (
                <>
                  <Button
                    variant='outline'
                    disabled={isLoading}
                    onClick={() => setPrDialogOpen(true)}
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    {dict.confirmDialog.withPR}
                  </Button>
                  {mySupplierCodes.length > 0 && (
                    <Button
                      variant='outline'
                      disabled={isLoading}
                      onClick={() => setScDialogOpen(true)}
                    >
                      <Check className='mr-2 h-4 w-4' />
                      {dict.confirmDialog.withSC}
                    </Button>
                  )}
                </>
              )}

              {canApproveReview && (
                <Button disabled={isLoading} onClick={handleApproveReview}>
                  <Check className='mr-2 h-4 w-4' />
                  {dict.managerReviewDialog.approve}
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

              {canBook && (
                <Button disabled={isLoading} onClick={() => setBookOpen(true)}>
                  <BookOpen className='mr-2 h-4 w-4' />
                  {dict.bookDialog.action}
                </Button>
              )}

              {canReopen && (
                <Button
                  variant='outline'
                  disabled={isLoading}
                  onClick={handleReopen}
                >
                  <RefreshCcw className='mr-2 h-4 w-4' />
                  {dict.common.reopen}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      {invoice.logs && invoice.logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{dict.details.history}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {invoice.logs.map((log, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded border p-2 text-sm'
                >
                  <div>
                    <span className='font-medium'>{log.action}</span>
                    {log.comment && (
                      <span className='ml-2 text-muted-foreground'>
                        — {log.comment}
                      </span>
                    )}
                  </div>
                  <div className='text-right text-muted-foreground'>
                    <div>{extractNameFromEmail(log.user)}</div>
                    <div className='text-xs'>
                      {new Date(log.timestamp).toLocaleString('pl-PL')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ConfirmWithPRDialog
        open={prDialogOpen}
        onOpenChange={setPrDialogOpen}
        invoiceId={invoice._id}
        availablePRs={availablePRs}
        dict={dict}
        onSuccess={() => router.refresh()}
      />

      <ConfirmWithSCDialog
        open={scDialogOpen}
        onOpenChange={setScDialogOpen}
        invoiceId={invoice._id}
        supplierCodes={mySupplierCodes}
        dict={dict}
        onSuccess={() => router.refresh()}
      />

      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
        dict={dict}
        isLoading={isLoading}
      />

      <BookDialog
        open={bookOpen}
        onOpenChange={setBookOpen}
        onConfirm={handleBook}
        dict={dict}
        isLoading={isLoading}
      />
    </div>
  );
}
