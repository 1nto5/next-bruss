'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';
import { completeOvenProcess, startOvenProcess } from '../actions';
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
  const [scannedStartBatch, setScannedStartBatch] = useState('');
  const [scannedEndBatch, setScannedEndBatch] = useState('');

  // Error states for persistent error display in dialogs
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);

  // Input refs for focusing after success
  // The non-null assertion is safe because the ref is always attached to an <Input> element
  const startInputRef = useRef<HTMLInputElement>(null!);
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

  const { data, error, refetch, isFetching } =
    useGetOvenProcesses(selectedOven);

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

  // Memoized callback functions to prevent unnecessary dialog re-renders
  const handleStartProcess = useCallback(async () => {
    if (!scannedStartBatch) return;
    if (!isSuccess(data)) return;

    // Clear any previous error
    setStartError(null);

    if (isBatchRunningHere(scannedStartBatch)) {
      const errorMessage = 'HYDRA batch jest już w piecu!';
      setStartError(errorMessage);
      toast.error(errorMessage);
      setScannedStartBatch('');
      setTimeout(() => {
        startInputRef.current?.focus();
      }, 0);
      playNok();
      return;
    }

    toast.promise(
      startOvenProcess(selectedOven, scannedStartBatch, operators),
      {
        loading: 'Rozpoczynanie procesu...',
        success: (result) => {
          if ('success' in result && result.success) {
            playOvenIn();
            refetch();
            setScannedStartBatch('');
            setStartError(null); // Clear error on success
            // Focus input for next scan
            setTimeout(() => {
              startInputRef.current?.focus();
            }, 0);
            return 'Proces uruchomiony!';
          }
          if ('error' in result && result.error === 'duplicate batch') {
            playNok();
            const errorMessage = 'HYDRA batch istnieje w bazie danych!';
            setStartError(errorMessage);
            throw new Error(errorMessage);
          }
          playNok();
          const errorMessage = 'Nie można uruchomić procesu!';
          setStartError(errorMessage);
          throw new Error(errorMessage);
        },
        error: (error) => {
          playNok();
          const errorMessage = error.message || 'Skontaktuj się z IT!';
          setStartError(errorMessage);
          setScannedStartBatch('');
          setTimeout(() => {
            startInputRef.current?.focus();
          }, 0);
          return errorMessage;
        },
      },
    );
  }, [
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
    toast.promise(completeOvenProcess(existingProcess.id), {
      loading: 'Kończenie procesu...',
      success: (result) => {
        if ('success' in result && result.success) {
          playOvenOut();
          refetch();
          setScannedEndBatch('');
          setEndError(null); // Clear error on success
          // Focus input for next scan
          setTimeout(() => {
            endInputRef.current?.focus();
          }, 0);
          return 'Proces zakończony!';
        }
        playNok();
        const errorMessage = 'Skontaktuj się z IT!';
        setEndError(errorMessage);
        throw new Error(errorMessage);
      },
      error: (error) => {
        playNok();
        const errorMessage = 'Skontaktuj się z IT!';
        setEndError(errorMessage);
        setScannedEndBatch('');
        setTimeout(() => {
          endInputRef.current?.focus();
        }, 0);
        console.error(error);
        return errorMessage;
      },
    });
  }, [scannedEndBatch, data, refetch, playNok, playOvenOut]);

  // Error clear handlers
  const handleStartErrorClear = useCallback(() => {
    setStartError(null);
  }, []);

  const handleEndErrorClear = useCallback(() => {
    setEndError(null);
  }, []);

  if (error) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Błąd ładowania procesów</CardTitle>
          <CardDescription>Skontaktuj się z IT!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between gap-2'>
              <div>
                <CardTitle>Procesy wygrzewania</CardTitle>
              </div>
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
                    <TableHead>Data rozpoczęcia</TableHead>
                    <TableHead>Godzina rozpoczęcia</TableHead>
                    <TableHead>Temperatura</TableHead>
                    <TableHead>HYDRA batch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.success
                    .filter((process) => process.status === 'running')
                    .map((process) => {
                      const dateString = formatDate(process.startTime);
                      const fullString = formatDateTime(process.startTime);
                      const timeString =
                        fullString !== '-'
                          ? fullString.split(', ')[1] || '-'
                          : '-';

                      // Calculate average temperature from the most recent temperature log
                      let avgTemp: string | number = '-';
                      if (
                        process.temperatureLogs &&
                        process.temperatureLogs.length > 0
                      ) {
                        const latestLog =
                          process.temperatureLogs[
                            process.temperatureLogs.length - 1
                          ];
                        const values = Object.values(
                          latestLog.sensorData ?? {},
                        );
                        if (values.length > 0) {
                          const sum = values.reduce((acc, val) => acc + val, 0);
                          avgTemp = (sum / values.length).toFixed(1); // 1 decimal place
                        }
                      }

                      return (
                        <TableRow key={process.id}>
                          <TableCell>{dateString}</TableCell>
                          <TableCell>{timeString}</TableCell>
                          <TableCell>{avgTemp}</TableCell>
                          <TableCell className='font-mono font-medium'>
                            {process.hydraBatch}
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
        scannedBatch={scannedStartBatch}
        setScannedBatch={setScannedStartBatch}
        inputRef={startInputRef}
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
