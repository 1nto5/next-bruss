'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { useGetOvenProcesses } from '../data/get-oven-processes';
import { processType } from '../lib/types';
import { TerminateProcessDialog } from './terminate-process-dialog';

export function ProcessesTable() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimeRemaining = (remainingSeconds: number) => {
    if (remainingSeconds <= 0) return 'Finished';

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const {
    data: ovenProcesses,
    error: processesError,
    isLoading: isLoadingProcesses,
    refetch: refetchProcesses,
  } = useGetOvenProcesses();

  if (isLoadingProcesses) {
    return <div className='p-4'>Loading oven processes...</div>;
  }

  if (processesError) {
    return <div className='p-4 text-red-500'>Error loading oven processes</div>;
  }

  return (
    <Card>
      <CardHeader>Oven Processes</CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article Number</TableHead>
              <TableHead>Article Name</TableHead>
              <TableHead>Temperature (°C)</TableHead>
              <TableHead>Baking Time (min)</TableHead>
              <TableHead>Oven Number</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Time Remaining</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ovenProcesses?.map((process: processType) => {
              const startTime = new Date(process.startProcessAt);
              const endTime = new Date(process.plannedProcessEndTimeAt);
              const remainingMs = endTime.getTime() - currentTime.getTime();
              const remainingSeconds = Math.floor(remainingMs / 1000);
              const isFinished = remainingSeconds <= 0;
              const isTerminated = !!process.terminatedAt;

              return (
                <TableRow
                  key={`${process.articleNumber}-${process.ovenNumber}`}
                  className={
                    isTerminated
                      ? 'bg-gray-100 opacity-75'
                      : isFinished
                        ? 'animate-pulse border-red-300 bg-red-100'
                        : ''
                  }
                >
                  <TableCell
                    className={
                      isTerminated
                        ? 'text-gray-500'
                        : isFinished
                          ? 'font-semibold text-red-700'
                          : ''
                    }
                  >
                    {process.articleNumber}
                  </TableCell>
                  <TableCell
                    className={
                      isTerminated
                        ? 'text-gray-500'
                        : isFinished
                          ? 'font-semibold text-red-700'
                          : ''
                    }
                  >
                    {process.articleName}
                  </TableCell>
                  <TableCell
                    className={
                      isTerminated
                        ? 'text-gray-500'
                        : isFinished
                          ? 'font-semibold text-red-700'
                          : ''
                    }
                  >
                    {process.temp}
                  </TableCell>
                  <TableCell
                    className={
                      isTerminated
                        ? 'text-gray-500'
                        : isFinished
                          ? 'font-semibold text-red-700'
                          : ''
                    }
                  >
                    {process.ovenTime / 60}
                  </TableCell>
                  <TableCell
                    className={
                      isTerminated
                        ? 'text-gray-500'
                        : isFinished
                          ? 'font-semibold text-red-700'
                          : ''
                    }
                  >
                    {process.ovenNumber}
                  </TableCell>
                  <TableCell
                    className={
                      isTerminated
                        ? 'text-gray-500'
                        : isFinished
                          ? 'font-semibold text-red-700'
                          : ''
                    }
                  >
                    {process.operators?.length
                      ? process.operators.join(', ')
                      : '-'}
                  </TableCell>
                  <TableCell
                    className={`font-mono text-sm ${
                      isTerminated
                        ? 'text-gray-500'
                        : isFinished
                          ? 'font-semibold text-red-700'
                          : ''
                    }`}
                  >
                    {formatDateTime(startTime)}
                  </TableCell>
                  <TableCell
                    className={`font-mono text-sm ${
                      isTerminated
                        ? 'text-gray-500'
                        : isFinished
                          ? 'font-semibold text-red-700'
                          : ''
                    }`}
                  >
                    {formatDateTime(endTime)}
                  </TableCell>
                  <TableCell
                    className={`font-mono ${
                      isTerminated
                        ? 'text-gray-500'
                        : isFinished
                          ? 'animate-pulse font-bold text-red-700'
                          : remainingSeconds < 300
                            ? 'font-semibold text-orange-600'
                            : ''
                    }`}
                  >
                    {isTerminated
                      ? 'Terminated'
                      : formatTimeRemaining(remainingSeconds)}
                  </TableCell>
                  <TableCell>
                    <TerminateProcessDialog
                      process={process}
                      onTerminated={() => refetchProcesses()}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {(!ovenProcesses || ovenProcesses.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className='text-muted-foreground text-center'
                >
                  No oven processes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
