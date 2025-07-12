'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import { useState } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';
import { completeOvenProcess, startOvenProcess } from '../actions';
import { useGetOvenProcesses } from '../data/get-oven-processes';
import { useOvenStore, usePersonalNumberStore } from '../lib/stores';
import type { OvenProcessType } from '../lib/types';

export default function ProcessList() {
  const { selectedOven } = useOvenStore();
  const { personalNumber1, personalNumber2, personalNumber3 } =
    usePersonalNumberStore();

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

  // Sound effects
  const [playOvenIn] = useSound('/oven-in.wav', { volume: 0.75 });
  const [playOvenOut] = useSound('/oven-out.wav', { volume: 0.75 });
  const [playNok] = useSound('/nok.mp3', { volume: 0.75 });

  const operators = [personalNumber1, personalNumber2, personalNumber3].filter(
    (person) => person,
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

  // Start process handler
  const handleStartBatch = async () => {
    if (!scannedStartBatch) return;
    if (!isSuccess(data)) return;

    if (isBatchRunningHere(scannedStartBatch)) {
      toast.error('HYDRA batch jest już w piecu');
      playNok();
      return;
    }

    toast.promise(
      startOvenProcess(selectedOven, scannedStartBatch, operators),
      {
        loading: 'Rozpoczynanie procesu...',
        success: (result) => {
          if (result.success) {
            playOvenIn();
            refetch();
            setScannedStartBatch('');
            setStartDialogOpen(false);
            return 'Proces uruchomiony!';
          }
          if (result.error === 'duplicate batch') {
            playNok();
            throw new Error('HYDRA batch istnieje w bazie danych');
          }
          playNok();
          throw new Error('Nie można uruchomić procesu!');
        },
        error: (error) => {
          playNok();
          return error.message || 'Skontaktuj się z IT!';
        },
      },
    );
  };

  // End process handler
  const handleEndBatch = async () => {
    if (!scannedEndBatch) return;
    if (!isSuccess(data)) return;
    const existingProcess = data.success.find(
      (process) =>
        process.hydraBatch === scannedEndBatch && process.status === 'running',
    );
    if (!existingProcess) {
      toast.error('Brak aktywnego procesu dla HYDRA batch');
      playNok();
      return;
    }
    toast.promise(completeOvenProcess(existingProcess.id), {
      loading: 'Kończenie procesu...',
      success: (result) => {
        if (result.success) {
          playOvenOut();
          refetch();
          setScannedEndBatch('');
          setEndDialogOpen(false);
          return 'Proces zakończony!';
        }
        playNok();
        throw new Error('Nie można zakończyć procesu!');
      },
      error: (error) => {
        playNok();
        return error.message || 'Skontaktuj się z IT!';
      },
    });
  };

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
              <div className='text-center'>
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
      <Dialog
        open={startDialogOpen}
        onOpenChange={(open) => {
          setStartDialogOpen(open);
          setScannedStartBatch('');
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Nowy proces</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Input
              value={scannedStartBatch}
              onChange={(e) => setScannedStartBatch(e.target.value)}
              className='text-center'
              placeholder='Zeskanuj HYDRA batch...'
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  await handleStartBatch();
                }
              }}
            />
            <div className='flex gap-2'>
              <Button
                onClick={() => {
                  setStartDialogOpen(false);
                  setScannedStartBatch('');
                }}
                className='flex-1'
                variant='outline'
              >
                Anuluj
              </Button>
              <Button
                onClick={handleStartBatch}
                className='flex-1'
                disabled={!scannedStartBatch}
              >
                Rozpocznij
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* End HYDRA Batch Dialog */}
      <Dialog
        open={endDialogOpen}
        onOpenChange={(open) => {
          setEndDialogOpen(open);
          setScannedEndBatch('');
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Zakończ proces</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <Input
              value={scannedEndBatch}
              onChange={(e) => setScannedEndBatch(e.target.value)}
              className='text-center'
              placeholder='Zeskanuj HYDRA batch...'
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  await handleEndBatch();
                }
              }}
            />
            <div className='flex gap-2'>
              <Button
                onClick={() => {
                  setEndDialogOpen(false);
                  setScannedEndBatch('');
                }}
                className='flex-1'
                variant='outline'
              >
                Anuluj
              </Button>
              <Button
                onClick={handleEndBatch}
                className='flex-1'
                disabled={!scannedEndBatch}
              >
                Zakończ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
