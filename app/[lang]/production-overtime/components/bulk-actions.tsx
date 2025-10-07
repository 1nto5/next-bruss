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
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { Table } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import { Session } from 'next-auth';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  bulkApproveOvertimeRequests,
  bulkCancelOvertimeRequests,
  bulkMarkAsAccountedOvertimeRequests,
} from '../actions';
import { OvertimeType } from '../lib/types';

interface BulkActionsProps {
  table: Table<OvertimeType>;
  session: Session | null;
}

export default function BulkActions({ table, session }: BulkActionsProps) {
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<
    'approve' | 'cancel' | 'account' | null
  >(null);

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) {
    return null;
  }

  const userRoles = session?.user?.roles || [];
  const isAdmin = userRoles.includes('admin');
  const isPlantManager = userRoles.includes('plant-manager');
  const isHR = userRoles.includes('hr');
  const userEmail = session?.user?.email;

  // Determine which actions are available for ALL selected items
  const canApprove = selectedRows.every((row) => {
    const request = row.original;
    return (isPlantManager || isAdmin) && request.status === 'pending';
  });

  const canCancel = selectedRows.every((row) => {
    const request = row.original;
    return (
      request._id &&
      request.status !== 'completed' &&
      request.status !== 'canceled' &&
      request.status !== 'accounted' &&
      (request.requestedBy === userEmail ||
        isPlantManager ||
        isAdmin ||
        userRoles.includes('group-leader') ||
        userRoles.includes('production-manager') ||
        userRoles.includes('hr'))
    );
  });

  const canMarkAsAccounted = selectedRows.every((row) => {
    const request = row.original;
    return isHR && request.status === 'completed';
  });

  const hasAnyAction = canApprove || canCancel || canMarkAsAccounted;

  // Helper function to get Polish pluralization
  const getPlural = (count: number) => {
    if (count === 1) return 'zlecenie';
    if (
      count % 10 >= 2 &&
      count % 10 <= 4 &&
      (count % 100 < 10 || count % 100 >= 20)
    ) {
      return 'zlecenia';
    }
    return 'zleceń';
  };

  const handleAction = async (type: 'approve' | 'cancel' | 'account') => {
    const selectedIds = selectedRows.map((row) => row.original._id);

    let actionPromise;
    let successMessage;

    switch (type) {
      case 'approve':
        actionPromise = bulkApproveOvertimeRequests(selectedIds);
        successMessage = 'Zlecenia zostały zatwierdzone';
        break;
      case 'cancel':
        actionPromise = bulkCancelOvertimeRequests(selectedIds);
        successMessage = 'Zlecenia zostały anulowane';
        break;
      case 'account':
        actionPromise = bulkMarkAsAccountedOvertimeRequests(selectedIds);
        successMessage = 'Zlecenia zostały rozliczone';
        break;
    }

    toast.promise(actionPromise, {
      loading: 'Przetwarzanie...',
      success: (result) => {
        if (result.error) {
          throw new Error(result.error);
        }
        table.resetRowSelection();
        return `${successMessage} (${result.count})`;
      },
      error: (error) => `Błąd: ${error.message}`,
    });
  };

  const openConfirmDialog = (type: 'approve' | 'cancel' | 'account') => {
    setActionType(type);
    setIsAlertDialogOpen(true);
  };

  const handleConfirm = () => {
    if (actionType) {
      handleAction(actionType);
    }
    setIsAlertDialogOpen(false);
    setActionType(null);
  };

  const getDialogContent = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Zatwierdź wybrane zlecenia',
          description: `Czy na pewno chcesz zatwierdzić ${selectedCount} ${getPlural(selectedCount)}?`,
        };
      case 'cancel':
        return {
          title: 'Anuluj wybrane zlecenia',
          description: `Czy na pewno chcesz anulować ${selectedCount} ${getPlural(selectedCount)}?`,
        };
      case 'account':
        return {
          title: 'Rozlicz wybrane zlecenia',
          description: `Czy na pewno chcesz rozliczyć ${selectedCount} ${getPlural(selectedCount)}?`,
        };
      default:
        return { title: '', description: '' };
    }
  };

  return (
    <>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogContent().title}</AlertDialogTitle>
            <AlertDialogDescription>
              {getDialogContent().description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Potwierdź
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className='p-4'>
          <CardDescription>
            Wybrano {selectedCount} {getPlural(selectedCount)}
            {!hasAnyAction && (
              <>
                <br />
                <span className='text-muted-foreground'>
                  Brak wspólnych akcji dla zaznaczonych zleceń.
                </span>
              </>
            )}
          </CardDescription>
          {hasAnyAction && (
            <div className='flex flex-wrap gap-2'>
              {canApprove && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => openConfirmDialog('approve')}
                >
                  <Check className='' />
                  Zatwierdź
                </Button>
              )}
              {canCancel && (
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => openConfirmDialog('cancel')}
                >
                  <X className='' />
                  Anuluj
                </Button>
              )}
              {canMarkAsAccounted && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => openConfirmDialog('account')}
                >
                  <Check className='' />
                  Rozlicz
                </Button>
              )}
            </div>
          )}
        </CardHeader>
      </Card>
    </>
  );
}
