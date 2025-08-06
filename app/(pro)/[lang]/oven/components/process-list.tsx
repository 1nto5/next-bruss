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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AlertTriangle, Play, ScanLine, StopCircle, X } from 'lucide-react';
import { useParams } from 'next/navigation';
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
import { useOvenStore, usePersonalNumberStore } from '../lib/stores';
import type { OvenProcessType } from '../lib/types';
import type { EndBatchType, StartBatchType } from '../lib/zod';
import { endBatchSchema, startBatchSchema } from '../lib/zod';
import { EndBatchDialog } from './end-batch-dialog';
import { StartBatchDialog } from './start-batch-dialog';

const errorMessageMap: Record<string, string> = {
  'duplicate batch': 'HYDRA batch istnieje w bazie danych!',
  'no operator': 'Co najmniej jeden operator jest wymagany',
  'not created': 'Nie udało się utworzyć procesu',
  'not completed': 'Nie udało się zakończyć procesu',
  'not deleted': 'Nie udało się usunąć procesu',
  'wrong number 1': 'Nieprawidłowy numer personalny',
  'wrong number 2': 'Nieprawidłowy numer personalny',
  'wrong number 3': 'Nieprawidłowy numer personalny',
  'login error': 'Błąd logowania - skontaktuj się z IT',
  'config error': 'Błąd konfiguracji pieca - skontaktuj się z IT',
  'fetch error': 'Błąd pobierania procesów - skontaktuj się z IT',
  'start error': 'Błąd uruchamiania procesu - skontaktuj się z IT',
  'complete error': 'Błąd kończenia procesu - skontaktuj się z IT',
  'delete error': 'Błąd usuwania procesu - skontaktuj się z IT',
  'temp error': 'Błąd temperatury pieca - skontaktuj się z IT',
  'validation failed': 'Skontaktuj się z IT!',
  'article not configured': 'Artykuł nie jest skonfigurowany!',
  'wrong program for article': 'Artykuł nie pasuje do wybranego programu!',
  'database error': 'Błąd bazy danych - skontaktuj się z IT',
};

const translateError = (serverError: string): string => {
  return errorMessageMap[serverError] || 'Skontaktuj się z IT!';
};

export default function ProcessList() {
  const { selectedOven, selectedProgram } = useOvenStore();
  const { operator1, operator2, operator3 } = usePersonalNumberStore();
  const params = useParams<{ lang: Locale }>();
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
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleString(params?.lang || 'pl');
  };

  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);

  const articleInputRef = useRef<HTMLInputElement>(null!);
  const batchInputRef = useRef<HTMLInputElement>(null!);
  const endInputRef = useRef<HTMLInputElement>(null!);

  const [playOvenIn] = useSound('/oven-in.wav', { volume: 0.75 });
  const [playOvenOut] = useSound('/oven-out.wav', { volume: 0.75 });
  const [playNok] = useSound('/nok.mp3', { volume: 0.75 });
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

    return expectedCompletion.toLocaleString(params?.lang || 'pl');
  };

  const formatOperators = (operators?: string[]): string => {
    if (!operators || operators.length === 0) return '-';
    return operators.join(', ');
  };

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

      const loadingToast = toast.loading('Rozpoczynanie procesu...');

      try {
        const result = await startOvenProcess(
          selectedOven,
          scannedArticle,
          scannedBatch,
          operators,
          selectedProgram!,
        );

        if ('success' in result && result.success) {
          playOvenIn();
          refetch();
          setTimeout(() => {
            articleInputRef.current?.focus();
          }, 0);
          toast.success('Proces uruchomiony!', { id: loadingToast });
          return;
        }

        if ('error' in result && result.error) {
          playNok();
          const errorMessage = translateError(result.error);
          setTimeout(() => {
            batchInputRef.current?.focus();
          }, 0);
          toast.error(errorMessage, { id: loadingToast });
          return;
        }

        // Unexpected response format
        playNok();
        setTimeout(() => {
          batchInputRef.current?.focus();
        }, 0);
        console.error('Unexpected response format:', result);
        toast.error('Skontaktuj się z IT!', { id: loadingToast });
        return;
      } catch (error) {
        // Network or other unexpected errors
        playNok();
        setTimeout(() => {
          batchInputRef.current?.focus();
        }, 0);
        console.error('Start process error:', error);
        toast.error('Skontaktuj się z IT!', { id: loadingToast });
        return;
      }
    },
    [
      data,
      selectedOven,
      selectedProgram,
      operators,
      refetch,
      playNok,
      playOvenIn,
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
        const errorMessage = 'Brak aktywnego procesu dla HYDRA batch!';
        toast.error(errorMessage);
        setTimeout(() => {
          endInputRef.current?.focus();
        }, 0);
        playNok();
        return; // Don't throw
      }

      const loadingToast = toast.loading('Kończenie procesu...');

      try {
        const result = await completeOvenProcess(existingProcess.id, operators);

        if ('success' in result && result.success) {
          playOvenOut();
          refetch();
          setTimeout(() => {
            endInputRef.current?.focus();
          }, 0);
          toast.success('Proces zakończony!', { id: loadingToast });
          return;
        }

        if ('error' in result && result.error) {
          playNok();
          const errorMessage = translateError(result.error);
          setTimeout(() => {
            endInputRef.current?.focus();
          }, 0);
          toast.error(errorMessage, { id: loadingToast });
          return;
        }

        // Unexpected response format
        playNok();
        setTimeout(() => {
          endInputRef.current?.focus();
        }, 0);
        console.error('Unexpected response format:', result);
        toast.error('Skontaktuj się z IT!', { id: loadingToast });
        return;
      } catch (error) {
        // Network or other unexpected errors
        playNok();
        setTimeout(() => {
          endInputRef.current?.focus();
        }, 0);
        console.error('End process error:', error);
        toast.error('Skontaktuj się z IT!', { id: loadingToast });
        return;
      }
    },
    [data, refetch, playNok, playOvenOut],
  );

  const handleDeleteClick = useCallback((processId: string) => {
    setProcessToDelete(processId);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!processToDelete) return;

    setDeleteDialogOpen(false);

    const loadingToast = toast.loading('Usuwanie procesu...');

    try {
      const result = await deleteOvenProcess(processToDelete);

      if ('success' in result && result.success) {
        refetch();
        toast.success('Proces usunięty!', { id: loadingToast });
        setProcessToDelete(null);
        return;
      }

      if ('error' in result && result.error) {
        const errorMessage = translateError(result.error);
        toast.error(errorMessage, { id: loadingToast });
        setProcessToDelete(null);
        return;
      }

      toast.error('Skontaktuj się z IT!', { id: loadingToast });
      setProcessToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error('Skontaktuj się z IT!', { id: loadingToast });
      setProcessToDelete(null);
    }
  }, [processToDelete, refetch]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setProcessToDelete(null);
  }, []);

  if (error) {
    return <ErrorComponent error={error} reset={() => refetch()} />;
  }

  return (
    <>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between gap-2'>
              <CardTitle>Procesy wygrzewania</CardTitle>
              <div className='flex gap-2'>
                <Button onClick={() => setStartDialogOpen(true)}>
                  <Play />
                  Nowy proces
                </Button>
                <Button
                  onClick={() => setEndDialogOpen(true)}
                  variant='secondary'
                >
                  <StopCircle />
                  Zakończ proces
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isFetching && !isSuccess(data) ? (
              <Skeleton className='h-96 w-full' />
            ) : isSuccess(data) && data.success.length > 0 ? (
              <div className='space-y-4'>
                {currentTemp === null &&
                  !data.success.every((process) => process.status === 'prepared') &&
                  data.success.some((process) => {
                    const startTime = new Date(process.startTime);
                    const now = new Date();
                    const fiveMinutesAgo = now.getTime() - 5 * 60 * 1000;
                    return startTime.getTime() < fiveMinutesAgo;
                  }) && (
                    <Alert>
                      <AlertTriangle className='h-4 w-4' />
                      <AlertTitle>Brak odczytu temperatury</AlertTitle>
                      <AlertDescription>
                        System nie uzyskał danych z czujników temperatur. Jeśli
                        piec jest już uruchomiony, skontaktuj się z IT!
                      </AlertDescription>
                    </Alert>
                  )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start</TableHead>
                      <TableHead>Artykuł</TableHead>
                      <TableHead>HYDRA batch</TableHead>
                      <TableHead>Planowane zakończenie</TableHead>
                      <TableHead className='w-16'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.success.map((process) => {
                      const startString = formatDateTime(process.startTime);

                      return (
                        <TableRow key={process.id}>
                          <TableCell>
                            {process.status === 'prepared' ? 'oczekuje' : startString}
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
                              title='Usuń proces'
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
                  Brak rozpoczętych procesów
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
      />

      <EndBatchDialog
        open={endDialogOpen}
        onOpenChange={setEndDialogOpen}
        inputRef={endInputRef}
        onEnd={handleEndProcess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń proces</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć ten proces? Ta akcja nie może zostać
              cofnięta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
