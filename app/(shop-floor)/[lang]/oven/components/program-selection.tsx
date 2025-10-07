'use client';

import ErrorComponent from '@/components/error-component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TimerReset } from 'lucide-react';
import { useOvenProgram } from '../data/get-oven-program';
import type { Dictionary } from '../lib/dict';
import { useOvenStore } from '../lib/stores';

interface ProgramSelectionProps {
  dict: Dictionary;
}

export default function ProgramSelection({ dict }: ProgramSelectionProps) {
  const { selectedOven, setSelectedProgram } = useOvenStore();
  const { data, isLoading, error } = useOvenProgram();

  const handleProgramSelect = (program: number) => {
    setSelectedProgram(program);
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error || !data || 'error' in data) {
    return (
      <ErrorComponent
        error={
          error ||
          new Error(
            data && 'error' in data ? data.error : dict.programSelection.errorLoadPrograms,
          )
        }
        reset={() => window.location.reload()}
      />
    );
  }

  const availablePrograms = data.success;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {dict.programSelection.title} {selectedOven.toUpperCase()}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {availablePrograms.map((programNumber) => (
            <Button
              key={programNumber}
              onClick={() => handleProgramSelect(programNumber)}
              variant='outline'
              className='hover:bg-primary hover:text-primary-foreground flex h-full min-h-[150px] flex-col items-center justify-center space-y-3 p-6 text-center'
            >
              <TimerReset className='h-12 w-12' />
              <div className='space-y-1'>
                <div className='text-2xl font-bold'>{programNumber}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
