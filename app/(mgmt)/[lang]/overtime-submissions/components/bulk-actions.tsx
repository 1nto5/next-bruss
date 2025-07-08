'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import { Session } from 'next-auth';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  bulkApproveOvertimeSubmissions,
  bulkCancelOvertimeRequests,
  bulkMarkAsAccountedOvertimeSubmissions,
  bulkRejectOvertimeSubmissions,
} from '../actions';
import { OvertimeSubmissionType } from '../lib/types';

interface BulkActionsProps {
  table: Table<OvertimeSubmissionType>;
  session: Session | null;
}

export default function BulkActions({ table, session }: BulkActionsProps) {
  // All hooks at the top
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingActionType, setPendingActionType] = useState<
    null | 'approve' | 'reject' | 'settle' | 'cancel'
  >(null);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row) => row.original._id);
  const selectedCount = selectedRows.length;

  const userRoles = session?.user?.roles || [];
  const isHR = userRoles.includes('hr');
  const isAdmin = userRoles.includes('admin');
  const userEmail = session?.user?.email;

  // Check what actions are available based on ALL selected rows
  const allCanApprove =
    selectedRows.length > 0 &&
    selectedRows.every((row) => {
      const submission = row.original;
      return (
        (submission.supervisor === userEmail || isHR || isAdmin) &&
        submission.status === 'pending'
      );
    });
  const allCanReject =
    selectedRows.length > 0 &&
    selectedRows.every((row) => {
      const submission = row.original;
      return (
        (submission.supervisor === userEmail || isHR || isAdmin) &&
        submission.status === 'pending'
      );
    });
  const allCanMarkAsAccounted =
    selectedRows.length > 0 &&
    selectedRows.every((row) => {
      const submission = row.original;
      return (isHR || isAdmin) && submission.status === 'approved';
    });
  const allCanCancel =
    selectedRows.length > 0 &&
    selectedRows.every((row) => {
      const submission = row.original;
      return (
        submission.submittedBy === userEmail && submission.status === 'pending'
      );
    });

  const hasAnyAction =
    allCanApprove || allCanReject || allCanMarkAsAccounted || allCanCancel;
  // Always show the card if at least one item is selected
  if (selectedCount === 0) return null;

  // Universal confirm dialog handler
  const handleConfirm = () => {
    if (!pendingActionType) return;
    if (pendingActionType === 'approve') handleBulkApprove();
    if (pendingActionType === 'settle') handleBulkMarkAsAccounted();
    if (pendingActionType === 'cancel') handleBulkCancel();
    if (pendingActionType === 'reject') setIsRejectDialogOpen(true); // Show reject dialog after confirm
    setPendingActionType(null);
    setIsAlertOpen(false);
  };

  // Instead of confirmAndRun, use this for all actions
  const openConfirmDialog = (
    type: 'approve' | 'reject' | 'settle' | 'cancel',
  ) => {
    setPendingActionType(type);
    setIsAlertOpen(true);
  };

  const handleBulkApprove = async () => {
    toast.promise(
      bulkApproveOvertimeSubmissions(selectedIds).then((res) => {
        if ('success' in res) {
          table.resetRowSelection();
          return res;
        } else {
          throw new Error(res.error || 'Błąd zatwierdzania');
        }
      }),
      {
        loading: 'Zatwierdzanie... ',
        success: (res) => `Zatwierdzono ${res.count} z ${res.total} zgłoszeń!`,
        error: (error) => error.message || 'Błąd zatwierdzania',
      },
    );
  };

  const handleBulkReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Podaj powód odrzucenia');
      return;
    }
    toast.promise(
      bulkRejectOvertimeSubmissions(selectedIds, rejectionReason).then(
        (res) => {
          if ('success' in res) {
            table.resetRowSelection();
            setIsRejectDialogOpen(false);
            setRejectionReason('');
            return res;
          } else {
            throw new Error(res.error || 'Błąd odrzucania');
          }
        },
      ),
      {
        loading: 'Odrzucanie... ',
        success: (res) => `Odrzucono ${res.count} z ${res.total} zgłoszeń!`,
        error: (error) => error.message || 'Błąd odrzucania',
      },
    );
  };

  const handleBulkMarkAsAccounted = async () => {
    toast.promise(
      bulkMarkAsAccountedOvertimeSubmissions(selectedIds).then((res) => {
        if ('success' in res) {
          table.resetRowSelection();
          return res;
        } else {
          throw new Error(res.error || 'Błąd rozliczania');
        }
      }),
      {
        loading: 'Rozliczanie... ',
        success: (res) => `Rozliczono ${res.count} z ${res.total} zgłoszeń!`,
        error: (error) => error.message || 'Błąd rozliczania',
      },
    );
  };

  const handleBulkCancel = async () => {
    toast.promise(
      bulkCancelOvertimeRequests(selectedIds).then((res) => {
        if ('success' in res) {
          table.resetRowSelection();
          return res;
        } else {
          throw new Error(res.error || 'Błąd anulowania');
        }
      }),
      {
        loading: 'Anulowanie... ',
        success: (res) => `Anulowano ${res.count} z ${res.total} zgłoszeń!`,
        error: (error) => error.message || 'Błąd anulowania',
      },
    );
  };

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź operację</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz wykonać tę operację na {selectedCount}{' '}
              zgłoszeniu
              {selectedCount === 1
                ? ''
                : selectedCount % 10 >= 2 &&
                    selectedCount % 10 <= 4 &&
                    ![12, 13, 14].includes(selectedCount % 100)
                  ? 'ach'
                  : 'ach'}
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingActionType(null)}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Potwierdź
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Card>
        {hasAnyAction ? (
          <>
            <CardHeader className='p-4'>
              <CardTitle>
                {(() => {
                  if (selectedCount === 1) return 'Wybrałeś 1 zgłoszenie:';
                  if (
                    [2, 3, 4].includes(selectedCount % 10) &&
                    ![12, 13, 14].includes(selectedCount % 100)
                  ) {
                    return `Wybrałeś ${selectedCount} zgłoszenia:`;
                  }
                  return `Wybrałeś ${selectedCount} zgłoszeń:`;
                })()}
              </CardTitle>
            </CardHeader>
            <div className='flex flex-wrap gap-2 px-4 pb-4'>
              {hasAnyAction ? (
                <>
                  {allCanApprove && (
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() => openConfirmDialog('approve')}
                    >
                      <Check className='' />
                      Zatwierdź
                    </Button>
                  )}
                  {allCanReject && (
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => openConfirmDialog('reject')}
                    >
                      <X className='' />
                      Odrzuć
                    </Button>
                  )}
                  {allCanMarkAsAccounted && (
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => openConfirmDialog('settle')}
                    >
                      <Check className='' />
                      Rozlicz
                    </Button>
                  )}
                  {allCanCancel && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => openConfirmDialog('cancel')}
                    >
                      <X className='' />
                      Anuluj
                    </Button>
                  )}
                </>
              ) : (
                <div className='text-muted-foreground py-2'>
                  Brak wspólnych akcji dla zaznaczonych zgłoszeń.
                </div>
              )}
            </div>
            <Dialog
              open={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Odrzuć wybrane zgłoszenia</DialogTitle>
                  <DialogDescription>
                    Czy na pewno chcesz odrzucić {selectedCount} wybranych
                    zgłoszeń? Podaj powód odrzucenia.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <Textarea
                    placeholder='Powód odrzucenia...'
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className='min-h-[100px]'
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsRejectDialogOpen(false);
                      setRejectionReason('');
                    }}
                  >
                    Anuluj
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={handleBulkReject}
                    disabled={!rejectionReason.trim()}
                  >
                    <X className='' />
                    Odrzuć
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className='p-4'>
            <div className='text-muted-foreground py-2'>
              Brak wspólnych akcji dla zaznaczonych zgłoszeń.
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
