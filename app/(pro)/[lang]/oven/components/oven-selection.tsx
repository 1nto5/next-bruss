'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useOvenStore } from '../lib/stores';

export default function OvenSelection() {
  const { setSelectedOven } = useOvenStore();

  const ovens = [
    { id: 'tem10', name: 'TEM10' },
    { id: 'tem11', name: 'TEM11' },
    { id: 'tem12', name: 'TEM12' },
    { id: 'tem13', name: 'TEM13' },
    { id: 'tem14', name: 'TEM14' },
    { id: 'tem15', name: 'TEM15' },
    { id: 'tem16', name: 'TEM16' },
    { id: 'tem17', name: 'TEM17' },
  ];

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
