'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, Loader2, LucideIcon } from 'lucide-react';

export interface StatusCardProps {
  title: string;
  icon: LucideIcon;
  current: number;
  max: number;
  isFull: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  fullLabel?: string;
  onViewDetails?: (e: React.MouseEvent) => void;
}

export default function StatusCard({
  title,
  icon: Icon,
  current,
  max,
  isFull,
  isLoading = false,
  disabled = false,
  fullLabel,
  onViewDetails,
}: StatusCardProps) {
  const progress = max > 0 ? (current / max) * 100 : 0;

  return (
    <Card>
      <CardHeader className='pt-4 pb-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon className='text-muted-foreground size-6' />
            <CardTitle className='text-base'>{title}</CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            {isFull && fullLabel && (
              <Badge variant='destructive' className='animate-pulse'>
                {fullLabel}
              </Badge>
            )}
            {onViewDetails && (
              <Button
                onClick={onViewDetails}
                variant='ghost'
                disabled={isLoading || disabled}
              >
                {isLoading ? (
                  <Loader2 className='text-muted-foreground animate-spin' />
                ) : (
                  <ExternalLink className='text-muted-foreground' />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='text-center'>
            <span className='text-4xl font-bold'>{current}</span>
            <span className='text-muted-foreground mx-2 text-2xl'>/</span>
            <span className='text-muted-foreground text-2xl'>{max}</span>
          </div>
          <Progress
            value={progress}
            className={`h-4 ${isFull ? '[&>div]:bg-destructive animate-pulse' : ''}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
