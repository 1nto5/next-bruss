'use client';

import StatusCard from '@/app/(shop-floor)/[lang]/components/status-card';
import { Package } from 'lucide-react';
import type { ArticleStatus } from '../lib/types';

interface StatusBarProps {
  dict: {
    article136: string;
    article153: string;
    article136Name: string;
    article153Name: string;
    boxesOnPallet: string;
    palletFull: string;
    scanPallet: string;
  };
  article136Status: ArticleStatus | null;
  article153Status: ArticleStatus | null;
  onRefresh: () => void;
}

export default function StatusBar({
  dict,
  article136Status,
  article153Status,
}: StatusBarProps) {
  return (
    <div className='grid grid-cols-2 gap-2'>
      <StatusCard
        title={`${dict.article136} - ${dict.article136Name}`}
        icon={Package}
        current={article136Status?.boxesOnPallet || 0}
        max={article136Status?.palletSize || 0}
        isFull={article136Status?.isFull || false}
        fullLabel={dict.palletFull}
      />
      <StatusCard
        title={`${dict.article153} - ${dict.article153Name}`}
        icon={Package}
        current={article153Status?.boxesOnPallet || 0}
        max={article153Status?.palletSize || 0}
        isFull={article153Status?.isFull || false}
        fullLabel={dict.palletFull}
      />
    </div>
  );
}
