'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, Package, Palette, User } from 'lucide-react';
import { useOperatorStore, useScanStore } from '../lib/stores';

interface StatusBarProps {
  workplace: string;
  articleNumber: string;
  articleName: string;
  operatorPersonalNumber: string;
  boxStatus: { piecesInBox: number; boxIsFull: boolean };
  palletStatus?: { boxesOnPallet: number; palletIsFull: boolean };
}

export default function StatusBar({
  workplace,
  articleNumber,
  articleName,
  operatorPersonalNumber,
  boxStatus,
  palletStatus,
}: StatusBarProps) {
  const { logout } = useOperatorStore();
  const { clearArticle } = useScanStore();

  return (
    <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary p-4'>
      <div className='flex items-center gap-2'>
        <User className='h-4 w-4' />
        <span className='text-sm'>{operatorPersonalNumber}</span>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            logout();
            clearArticle();
          }}
        >
          <LogOut className='h-4 w-4' />
        </Button>
      </div>

      <div className='flex items-center gap-2'>
        <Badge variant='outline'>{workplace.toUpperCase()}</Badge>
        <Badge>{articleNumber} - {articleName}</Badge>
      </div>

      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <Package className='h-4 w-4' />
          <span className={`text-sm font-medium ${boxStatus.boxIsFull ? 'text-green-600' : ''}`}>
            {boxStatus.piecesInBox} / {boxStatus.boxIsFull ? 'PEŁNY' : 'szt'}
          </span>
        </div>

        {palletStatus && (
          <div className='flex items-center gap-2'>
            <Palette className='h-4 w-4' />
            <span className={`text-sm font-medium ${palletStatus.palletIsFull ? 'text-green-600' : ''}`}>
              {palletStatus.boxesOnPallet} / {palletStatus.palletIsFull ? 'PEŁNA' : 'box'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}