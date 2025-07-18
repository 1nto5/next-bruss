'use client';

import ErrorComponent from '@/components/error-component';
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
import { Play, ScanLine, StopCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';
import { completeOvenProcess, startOvenProcess } from '../actions';
import { useOvenLastAvgTemp } from '../data/get-oven-last-avg-temp';
import { useGetOvenProcesses } from '../data/get-oven-processes';
import { useOvenStore, usePersonalNumberStore } from '../lib/stores';
import type { OvenProcessType } from '../lib/types';
import { EndBatchDialog } from './end-batch-dialog';
import { StartBatchDialog } from './start-batch-dialog';

export default function ProcessList() {
  const { selectedOven } = useOvenStore();
  const { operator1, operator2, operator3 } = usePersonalNumberStore();

  // Move hook calls to top level
  const params = useParams<{ lang: Locale }>();

  // Get current oven temperature for monitoring
  const { data: tempData } = useOvenLastAvgTemp(selectedOven);
  const currentTemp =
    tempData &&
    'avgTemp' in tempData &&
    typeof tempData.avgTemp === 'number' &&
    !isNaN(tempData.avgTemp)
      ? tempData.avgTemp
      : null;

  // State for forcing re-renders to update time calculations
  const [, setRefreshTrigger] = useState(0);

  // Auto-refresh estimated completion times every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Helper function to format dates
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleDateString(params?.lang || 'pl');
  };

  const formatDateTime = (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleString(params?.lang || 'pl');
  };

  // Dialog states for start/end
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  // Two-step scan state
  const [scannedArticle, setScannedArticle] = useState('');
  const [scannedStartBatch, setScannedStartBatch] = useState('');
  const [scannedEndBatch, setScannedEndBatch] = useState('');

  // Error states for persistent error display in dialogs
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);

  // Input refs for focusing after success
  const articleInputRef = useRef<HTMLInputElement>(null!);
  const batchInputRef = useRef<HTMLInputElement>(null!);
  const endInputRef = useRef<HTMLInputElement>(null!);

  // Loading states for dialogs (optional, currently not used)
  // const [startLoading, setStartLoading] = useState(false);
  // const [endLoading, setEndLoading] = useState(false);

  // Sound effects
  const [playOvenIn] = useSound('/oven-in.wav', { volume: 0.75 });
  const [playOvenOut] = useSound('/oven-out.wav', { volume: 0.75 });
  const [playNok] = useSound('/nok.mp3', { volume: 0.75 });

  // Memoize operators array to avoid unnecessary recalculations
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
  ); // Include config data

  function isSuccess(
    data: { success: OvenProcessType[] } | { error: string } | undefined,
  ): data is { success: OvenProcessType[] } {
    return !!data && 'success' in data;
  }

  // Helper: check if batch is running in this oven
  function isBatchRunningHere(batch: string) {
    if (!isSuccess(data)) return false;
    return data.success.some(
      (process) => process.hydraBatch === batch && process.status === 'running',
    );
  }

  // Helper function to format temperature with tolerance
  const formatTempWithTolerance = (
    temp?: number,
    tolerance?: number,
  ): string => {
    if (!temp || !tolerance) return '-';
    return `${temp}°C ±${tolerance}°C`;
  };

  // Helper function to format expected completion
  const formatExpectedCompletion = (expectedCompletion?: Date): string => {
    if (!expectedCompletion) return '-';
    const now = new Date();
    const timeLeft = expectedCompletion.getTime() - now.getTime();

    const absTime = Math.abs(timeLeft);
    const hours = Math.floor(absTime / (1000 * 60 * 60));
    const minutes = Math.floor((absTime % (1000 * 60 * 60)) / (1000 * 60));

    if (timeLeft < 0) {
      // Overdue: show negative value
      if (hours > 0) {
        return `-${hours}h ${minutes}m`;
      } else {
        return `-${minutes}m`;
      }
    } else {
      if (hours > 0) {
        return `~${hours}h ${minutes}m`;
      } else {
        return `~${minutes}m`;
      }
    }
  };

  // Helper function to determine temperature status
  const getTempStatus = (
    processTemp?: number,
    processTolerance?: number,
    currentTemp?: number | null,
  ): 'good' | 'danger' | 'unknown' => {
    if (
      !processTemp ||
      !processTolerance ||
      currentTemp === null ||
      currentTemp === undefined
    ) {
      return 'unknown';
    }

    const minTemp = processTemp - processTolerance;
    const maxTemp = processTemp + processTolerance;

    if (currentTemp >= minTemp && currentTemp <= maxTemp) {
      return 'good'; // Within tolerance - green
    } else {
      return 'danger'; // Out of range - red
    }
  };

  // Helper function to get temperature display with color coding
  const formatTempWithStatus = (
    temp?: number,
    tolerance?: number,
    currentTemp?: number | null,
  ) => {
    const tempString = formatTempWithTolerance(temp, tolerance);
    const status = getTempStatus(temp, tolerance, currentTemp);

    const classes = {
      good: 'text-green-600 dark:text-green-400 font-bold',
      danger: 'text-red-600 dark:text-red-400 animate-pulse font-bold',
      unknown: 'text-muted-foreground',
    };

    return {
      text: tempString,
      className: classes[status],
      status,
    };
  };

  // Memoized callback functions to prevent unnecessary dialog re-renders
  const handleStartProcess = useCallback(async () => {
    if (!scannedArticle || !scannedStartBatch) return;
    if (!isSuccess(data)) return;

    // Clear any previous error
    setStartError(null);

    if (isBatchRunningHere(scannedStartBatch)) {
      const errorMessage = 'HYDRA batch jest już w piecu!';
      setStartError(errorMessage);
      toast.error(errorMessage);
      setScannedStartBatch('');
      setTimeout(() => {
        batchInputRef.current?.focus();
      }, 0);
      playNok();
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading('Rozpoczynanie procesu...');
    // Add artificial delay to simulate loading for testing purposes

    try {
      const result = await startOvenProcess(
        selectedOven,
        scannedArticle,
        scannedStartBatch,
        operators,
      );

      if ('success' in result && result.success) {
        playOvenIn();
        refetch();
        setScannedArticle('');
        setScannedStartBatch('');
        setStartError(null);
        setTimeout(() => {
          articleInputRef.current?.focus();
        }, 0);
        toast.success('Proces uruchomiony!', { id: loadingToast });
        return;
      }

      if ('error' in result && result.error === 'duplicate batch') {
        playNok();
        const errorMessage = 'HYDRA batch istnieje w bazie danych!';
        setStartError(errorMessage);
        setScannedStartBatch('');
        setTimeout(() => {
          batchInputRef.current?.focus();
        }, 0);
        toast.error(errorMessage, { id: loadingToast });
        return;
      }

      playNok();
      const errorMessage = 'Skontaktuj się z IT!';
      setStartError(errorMessage);
      setScannedStartBatch('');
      setTimeout(() => {
        batchInputRef.current?.focus();
      }, 0);
      toast.error(errorMessage, { id: loadingToast });
    } catch (error) {
      playNok();
      const errorMessage = 'Skontaktuj się z IT!';
      setStartError(errorMessage);
      setScannedStartBatch('');
      setTimeout(() => {
        batchInputRef.current?.focus();
      }, 0);
      console.error(error);
      toast.error(errorMessage, { id: loadingToast });
    }
  }, [
    scannedArticle,
    scannedStartBatch,
    data,
    selectedOven,
    operators,
    refetch,
    playNok,
    playOvenIn,
  ]);

  // End process handler
  const handleEndProcess = useCallback(async () => {
    if (!scannedEndBatch) return;
    if (!isSuccess(data)) return;

    // Clear any previous error
    setEndError(null);

    const existingProcess = data.success.find(
      (process) =>
        process.hydraBatch === scannedEndBatch && process.status === 'running',
    );
    if (!existingProcess) {
      const errorMessage = 'Brak aktywnego procesu dla HYDRA batch!';
      setEndError(errorMessage);
      toast.error(errorMessage);
      setScannedEndBatch('');
      setTimeout(() => {
        endInputRef.current?.focus();
      }, 0);
      playNok();
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading('Kończenie procesu...');

    try {
      const result = await completeOvenProcess(existingProcess.id);

      if ('success' in result && result.success) {
        playOvenOut();
        refetch();
        setScannedEndBatch('');
        setEndError(null);
        setTimeout(() => {
          endInputRef.current?.focus();
        }, 0);
        toast.success('Proces zakończony!', { id: loadingToast });
        return;
      }

      playNok();
      const errorMessage = 'Skontaktuj się z IT!';
      setEndError(errorMessage);
      setScannedEndBatch('');
      setTimeout(() => {
        endInputRef.current?.focus();
      }, 0);
      toast.error(errorMessage, { id: loadingToast });
    } catch (error) {
      playNok();
      const errorMessage = 'Skontaktuj się z IT!';
      setEndError(errorMessage);
      setScannedEndBatch('');
      setTimeout(() => {
        endInputRef.current?.focus();
      }, 0);
      console.error(error);
      toast.error(errorMessage, { id: loadingToast });
    }
  }, [scannedEndBatch, data, refetch, playNok, playOvenOut]);

  // Error clear handlers
  const handleStartErrorClear = useCallback(() => {
    setStartError(null);
  }, []);

  const handleEndErrorClear = useCallback(() => {
    setEndError(null);
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
                  <Play className='mr-2 h-4 w-4' />
                  Nowy proces
                </Button>
                <Button
                  onClick={() => setEndDialogOpen(true)}
                  variant='secondary'
                >
                  <StopCircle className='mr-2 h-4 w-4' />
                  Zakończ proces
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isFetching && !isSuccess(data) ? (
              <Skeleton className='h-96 w-full' />
            ) : isSuccess(data) &&
              data.success.filter((process) => process.status === 'running')
                .length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start</TableHead>
                    <TableHead>Artykuł</TableHead>
                    <TableHead>HYDRA batch</TableHead>
                    <TableHead>Oczekiwana temperatura</TableHead>
                    <TableHead>Przewidywane zakończenie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.success
                    .filter((process) => process.status === 'running')
                    .map((process) => {
                      const startString = formatDateTime(process.startTime);
                      const tempDisplay = formatTempWithStatus(
                        process.config?.temp,
                        process.config?.tempTolerance,
                        currentTemp,
                      );

                      return (
                        <TableRow key={process.id}>
                          <TableCell>{startString}</TableCell>
                          <TableCell>{process.article}</TableCell>
                          <TableCell>{process.hydraBatch}</TableCell>
                          <TableCell className={tempDisplay.className}>
                            {tempDisplay.text}
                          </TableCell>
                          <TableCell
                            className={(() => {
                              const expected =
                                process.config?.expectedCompletion;
                              if (!expected) return undefined;
                              const now = new Date();
                              const end = new Date(expected);
                              const timeLeft = end.getTime() - now.getTime();
                              if (timeLeft < 0) {
                                return 'animate-pulse font-bold text-red-600 dark:text-red-400';
                              } else if (timeLeft <= 1000 * 60 * 60) {
                                // Less than 1 hour left
                                return 'animate-pulse font-bold';
                              }
                              return undefined;
                            })()}
                          >
                            {formatExpectedCompletion(
                              process.config?.expectedCompletion,
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
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

      {/* Start HYDRA Batch Dialog */}
      <StartBatchDialog
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
        scannedArticle={scannedArticle}
        setScannedArticle={setScannedArticle}
        scannedBatch={scannedStartBatch}
        setScannedBatch={setScannedStartBatch}
        articleInputRef={articleInputRef}
        batchInputRef={batchInputRef}
        onStart={handleStartProcess}
        error={startError}
        onErrorClear={handleStartErrorClear}
        // loading={startLoading}
      />

      {/* End HYDRA Batch Dialog */}
      <EndBatchDialog
        open={endDialogOpen}
        onOpenChange={setEndDialogOpen}
        scannedBatch={scannedEndBatch}
        setScannedBatch={setScannedEndBatch}
        inputRef={endInputRef}
        onEnd={handleEndProcess}
        error={endError}
        onErrorClear={handleEndErrorClear}
        // loading={endLoading}
      />
    </>
  );
}
