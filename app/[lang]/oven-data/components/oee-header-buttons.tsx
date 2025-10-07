'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface OeeHeaderButtonsProps {
  lang: string;
}

export default function OeeHeaderButtons({ lang }: OeeHeaderButtonsProps) {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const handleRefresh = async () => {
    if (isPending) return;

    setIsPending(true);

    // Invalidate all OEE queries to trigger refetch
    await queryClient.invalidateQueries({ queryKey: ['oee'] });

    // Reset pending state after a short delay
    setTimeout(() => {
      setIsPending(false);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Link href="..">
        <Button variant="outline" className="w-full sm:w-auto">
          <ArrowLeft />
          <span>Back to Oven Data</span>
        </Button>
      </Link>
      <Button
        onClick={handleRefresh}
        disabled={isPending}
        variant="outline"
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <Loader className="animate-spin" />
        ) : (
          <RefreshCw />
        )}
        <span>Refresh</span>
      </Button>
    </div>
  );
}
