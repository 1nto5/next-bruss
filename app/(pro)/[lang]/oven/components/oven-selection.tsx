'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useOvenStore } from '../lib/stores';

export default function OvenSelection() {
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

  // If no ovens are provided, show a message
  if (ovens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wybór pieca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground text-center'>
            Nie określono listy pieców w parametrach wyszukiwania (search params
            ovens).
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wybór pieca</CardTitle>
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
