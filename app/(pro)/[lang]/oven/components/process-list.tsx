'use client';

import ErrorComponent from '@/components/error-component';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Locale } from '@/i18n.config';
import {
  AlertTriangle,
  Play,
  ScanLine,
  StopCircle,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';
import {
  completeOvenProcess,
  deleteOvenProcess,
  startOvenProcess,
} from '../actions';
import { useOvenLastAvgTemp } from '../data/get-oven-last-avg-temp';
import { useGetOvenProcesses } from '../data/get-oven-processes';
import type { Dictionary } from '../lib/dictionary';
import { useOperatorStore, useOvenStore, useVolumeStore } from '../lib/stores';
import type { OvenProcessType } from '../lib/types';
import type { EndBatchType, StartBatchType } from '../lib/zod';
import { endBatchSchema, startBatchSchema } from '../lib/zod';
import { EndBatchDialog } from './end-batch-dialog';
import { StartBatchDialog } from './start-batch-dialog';

interface ProcessListProps {
  dict: Dictionary;
  lang: Locale;
}

export default function ProcessList({ dict, lang }: ProcessListProps) {
  const { selectedOven, selectedProgram } = useOvenStore();
  const { operator1, operator2, operator3 } = useOperatorStore();
  const { data: tempData } = useOvenLastAvgTemp(selectedOven);
  const currentTemp =
    tempData &&
    'avgTemp' in tempData &&
    typeof tempData.avgTemp === 'number' &&
    !isNaN(tempData.avgTemp)
      ? tempData.avgTemp
      : null;

  const formatDateTime = (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleString('pl-PL', { 
      timeZone: 'Europe/Warsaw' 
    });
  };

  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);

  const articleInputRef = useRef<HTMLInputElement>(null!);
  const batchInputRef = useRef<HTMLInputElement>(null!);
  const endInputRef = useRef<HTMLInputElement>(null!);

  const { volume } = useVolumeStore();
  const [playOvenIn] = useSound('/oven-in.wav', { volume });
  const [playOvenOut] = useSound('/oven-out.wav', { volume });
  const [playNok] = useSound('/nok.mp3', { volume });
  const operators = useMemo(
    () =>
      [operator1, operator2, operator3]
        .filter((op) => op && op.identifier)
        .map((op) => op!.identifier),
    [operator1, operator2, operator3],
  );

  const { data, error, refetch, isFetching } = useGetOvenProcesses(
    selectedOven,
    true,
  );

  function isSuccess(
    data: { success: OvenProcessType[] } | { error: string } | undefined,
  ): data is { success: OvenProcessType[] } {
    return !!data && 'success' in data;
  }

  const formatExpectedCompletion = (
    startTime?: Date,
    targetDuration?: number,
  ): string => {
    if (!startTime || !targetDuration) return '-';

    // Calculate expected completion time
    const expectedCompletion = new Date(
      startTime.getTime() + targetDuration * 1000,
    );

    return expectedCompletion.toLocaleString('pl-PL', { 
      timeZone: 'Europe/Warsaw' 
    });
  };

  const translateError = useCallback(
    (serverError: string): string => {
      const errorMap: Record<string, keyof typeof dict.processList.errors> = {
        'duplicate batch': 'duplicateBatch',
        'no operator': 'noOperator',
        'not created': 'notCreated',
        'not completed': 'notCompleted',
        'not deleted': 'notDeleted',
        'wrong number 1': 'wrongNumber1',
        'wrong number 2': 'wrongNumber2',
        'wrong number 3': 'wrongNumber3',
        'login error': 'loginError',
        'config error': 'configError',
        'fetch error': 'fetchError',
        'start error': 'startError',
        'complete error': 'completeError',
        'delete error': 'deleteError',
        'temp error': 'tempError',
        'validation failed': 'validationFailed',
        'article not configured': 'articleNotConfigured',
        'wrong program for article': 'wrongProgramForArticle',
        'database error': 'databaseError',
      };
      const errorKey = errorMap[serverError];
      return errorKey
        ? dict.processList.errors[errorKey]
        : dict.processList.toasts.contactIT;
    },
    [dict],
  );

  const handleStartProcess = useCallback(
    async (formData: StartBatchType) => {
      // Validate form data first
      const validationResult = startBatchSchema.safeParse(formData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        playNok();
        toast.error(firstError.message);
        setTimeout(() => {
          if (firstError.path[0] === 'scannedArticle') {
            articleInputRef.current?.focus();
          } else {
            batchInputRef.current?.focus();
          }
        }, 0);
        return;
      }

      const { scannedArticle, scannedBatch } = formData;
      if (!isSuccess(data)) return;

      toast.promise(
        async () => {
          const result = await startOvenProcess(
            selectedOven,
            scannedArticle,
            scannedBatch,
            operators,
            selectedProgram!,
          );

          if ('success' in result && result.success) {
            playOvenIn();
            await refetch();
            setTimeout(() => {
              articleInputRef.current?.focus();
            }, 0);
            return dict.processList.toasts.processStarted;
          }

          if ('error' in result && result.error) {
            playNok();
            const errorMessage = translateError(result.error);
            setTimeout(() => {
              batchInputRef.current?.focus();
            }, 0);
            throw new Error(errorMessage);
          }

          // Unexpected response format
          playNok();
          setTimeout(() => {
            batchInputRef.current?.focus();
          }, 0);
          console.error('Unexpected response format:', result);
          throw new Error(dict.processList.toasts.contactIT);
        },
        {
          loading: dict.processList.toasts.startingProcess,
          success: (msg) => msg,
          error: (err) => err.message || dict.processList.toasts.contactIT,
        },
      );
    },
    [
      data,
      selectedOven,
      selectedProgram,
      operators,
      refetch,
      playNok,
      playOvenIn,
      dict,
      translateError,
    ],
  );

  const handleEndProcess = useCallback(
    async (formData: EndBatchType) => {
      // Validate form data first
      const validationResult = endBatchSchema.safeParse(formData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        playNok();
        toast.error(firstError.message);
        setTimeout(() => {
          endInputRef.current?.focus();
        }, 0);
        return;
      }

      const { scannedBatch } = formData;
      if (!isSuccess(data)) return;

      const existingProcess = data.success.find(
        (process) =>
          process.hydraBatch === scannedBatch && process.status === 'running',
      );
      if (!existingProcess) {
        toast.error(dict.processList.toasts.noActiveProcess);
        setTimeout(() => {
          endInputRef.current?.focus();
        }, 0);
        playNok();
        return; // Don't throw
      }

      toast.promise(
        async () => {
          const result = await completeOvenProcess(
            existingProcess.id,
            operators,
          );

          if ('success' in result && result.success) {
            playOvenOut();
            await refetch();
            setTimeout(() => {
              endInputRef.current?.focus();
            }, 0);
            return dict.processList.toasts.processEnded;
          }

          if ('error' in result && result.error) {
            playNok();
            const errorMessage = translateError(result.error);
            setTimeout(() => {
              endInputRef.current?.focus();
            }, 0);
            throw new Error(errorMessage);
          }

          // Unexpected response format
          playNok();
          setTimeout(() => {
            endInputRef.current?.focus();
          }, 0);
          console.error('Unexpected response format:', result);
          throw new Error(dict.processList.toasts.contactIT);
        },
        {
          loading: dict.processList.toasts.endingProcess,
          success: (msg) => msg,
          error: (err) => err.message || dict.processList.toasts.contactIT,
        },
      );
    },
    [data, refetch, playNok, playOvenOut, dict, translateError, operators],
  );

  const handleDeleteClick = useCallback((processId: string) => {
    setProcessToDelete(processId);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!processToDelete) return;

    setDeleteDialogOpen(false);

    toast.promise(
      async () => {
        const result = await deleteOvenProcess(processToDelete);

        if ('success' in result && result.success) {
          await refetch();
          setProcessToDelete(null);
          return dict.processList.toasts.processDeleted;
        }

        if ('error' in result && result.error) {
          const errorMessage = translateError(result.error);
          setProcessToDelete(null);
          throw new Error(errorMessage);
        }

        setProcessToDelete(null);
        throw new Error(dict.processList.toasts.contactIT);
      },
      {
        loading: dict.processList.toasts.deletingProcess,
        success: (msg) => msg,
        error: (err) => err.message || dict.processList.toasts.contactIT,
      },
    );
  }, [processToDelete, refetch, dict, translateError]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setProcessToDelete(null);
  }, []);

  if (error) {
    return <ErrorComponent error={error} reset={() => refetch()} />;
  }

  return (
    <>
      <div>
        <Card>
          <CardHeader>
            <div className='flex gap-4'>
              <Button
                onClick={() => setStartDialogOpen(true)}
                className='w-1/2'
                size='lg'
              >
                <Play />
                {dict.processList.newProcess}
              </Button>
              <Button
                onClick={() => setEndDialogOpen(true)}
                variant='secondary'
                className='w-1/2'
                size='lg'
              >
                <StopCircle />
                {dict.processList.endProcess}
              </Button>
            </div>
          </CardHeader>
          <CardContent className='pt-6'>
            {isFetching && !isSuccess(data) ? (
              <Skeleton className='h-96 w-full' />
            ) : isSuccess(data) && data.success.length > 0 ? (
              <div className='space-y-4'>
                {currentTemp === null &&
                  !data.success.every(
                    (process) => process.status === 'prepared',
                  ) &&
                  data.success.some((process) => {
                    const startTime = new Date(process.startTime);
                    const now = new Date();
                    const fiveMinutesAgo = now.getTime() - 5 * 60 * 1000;
                    return startTime.getTime() < fiveMinutesAgo;
                  }) && (
                    <Alert>
                      <AlertTriangle className='h-4 w-4' />
                      <AlertTitle>
                        {dict.processList.alerts.noTemperature}
                      </AlertTitle>
                      <AlertDescription>
                        {dict.processList.alerts.noTemperatureDesc}
                      </AlertDescription>
                    </Alert>
                  )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dict.processList.table.start}</TableHead>
                      <TableHead>{dict.processList.table.article}</TableHead>
                      <TableHead>{dict.processList.table.hydraBatch}</TableHead>
                      <TableHead>{dict.processList.table.plannedEnd}</TableHead>
                      <TableHead className='w-16'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.success.map((process) => {
                      const startString = formatDateTime(process.startTime);

                      return (
                        <TableRow key={process.id}>
                          <TableCell>
                            {process.status === 'prepared'
                              ? dict.processList.table.waiting
                              : startString}
                          </TableCell>
                          <TableCell>{process.article}</TableCell>
                          <TableCell>{process.hydraBatch}</TableCell>
                          <TableCell
                            className={(() => {
                              if (!process.startTime || !process.targetDuration)
                                return undefined;
                              const expectedCompletion = new Date(
                                process.startTime.getTime() +
                                  process.targetDuration * 1000,
                              );
                              const now = new Date();
                              if (
                                expectedCompletion.getTime() < now.getTime()
                              ) {
                                return 'font-bold text-red-600 dark:text-red-400';
                              }
                              return undefined;
                            })()}
                          >
                            {formatExpectedCompletion(
                              process.startTime,
                              process.targetDuration,
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteClick(process.id)}
                              className='h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300'
                              title={dict.processList.deleteDialog.title}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className='py-14 text-center'>
                <ScanLine className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                <p className='text-muted-foreground text-lg'>
                  {dict.processList.noProcesses}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <StartBatchDialog
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
        articleInputRef={articleInputRef}
        batchInputRef={batchInputRef}
        onStart={handleStartProcess}
        dict={dict}
      />

      <EndBatchDialog
        open={endDialogOpen}
        onOpenChange={setEndDialogOpen}
        inputRef={endInputRef}
        onEnd={handleEndProcess}
        dict={dict}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dict.processList.deleteDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dict.processList.deleteDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex w-full flex-row gap-2'>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              className='flex w-1/4 items-center justify-center gap-2'
            >
              <X className='h-4 w-4' />
              {dict.processList.deleteDialog.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className='flex w-3/4 items-center justify-center gap-2'
            >
              <Trash2 className='h-4 w-4' />
              {dict.processList.deleteDialog.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
