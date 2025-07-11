'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Delete } from 'lucide-react';

interface NumericKeypadProps {
  onNumberClick: (number: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  className?: string;
}

export default function NumericKeypad({
  onNumberClick,
  onBackspace,
  onClear,
  className = '',
}: NumericKeypadProps) {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <Card className={`w-full max-w-sm ${className}`}>
      <CardContent className='p-4'>
        <div className='grid grid-cols-3 gap-3'>
          {numbers.slice(0, 9).map((number) => (
            <Button
              key={number}
              variant='outline'
              size='lg'
              className='h-16 text-2xl font-bold'
              onClick={() => onNumberClick(number)}
            >
              {number}
            </Button>
          ))}
          <Button
            variant='outline'
            size='lg'
            className='h-16 text-lg'
            onClick={onClear}
          >
            Clear
          </Button>
          <Button
            variant='outline'
            size='lg'
            className='h-16 text-2xl font-bold'
            onClick={() => onNumberClick('0')}
          >
            0
          </Button>
          <Button
            variant='outline'
            size='lg'
            className='h-16'
            onClick={onBackspace}
          >
            <Delete className='h-6 w-6' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
