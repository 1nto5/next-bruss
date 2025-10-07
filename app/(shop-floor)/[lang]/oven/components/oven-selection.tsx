'use client';

import ErrorComponent from '@/components/error-component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { Dictionary } from '../lib/dict';
import { useOvenStore } from '../lib/stores';

interface OvenSelectionProps {
  dict: Dictionary;
}

export default function OvenSelection({ dict }: OvenSelectionProps) {
  const { setSelectedOven } = useOvenStore();
  // Get search params from the URL
  const searchParams = useSearchParams();
  // Read the 'ovens' query parameter (comma-separated list of oven IDs)
  const ovensParam = searchParams.get('ovens');
  // Parse the parameter into an array of IDs (if present)
  const ovenIds = ovensParam
    ? ovensParam
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : [];

  // Map oven IDs to objects with id and name (name is uppercase version of id)
  const ovens = ovenIds.map((id) => ({ id, name: id.toUpperCase() }));

  // If no ovens are provided, show error component
  if (ovens.length === 0) {
    return (
      <ErrorComponent
        error={
          new Error(
            dict.ovenSelection.errorNoOvens,
          )
        }
        reset={() => window.location.reload()}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.ovenSelection.title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {ovens.map((oven) => (
            <Button
              key={oven.id}
              onClick={() => setSelectedOven(oven.id)}
              variant='outline'
              className='hover:bg-primary hover:text-primary-foreground flex h-full min-h-[150px] flex-col items-center justify-center space-y-3 p-6 text-center'
            >
              <Flame className='h-12 w-12' />
              <div className='space-y-1'>
                <div className='text-2xl font-bold'>{oven.name}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
