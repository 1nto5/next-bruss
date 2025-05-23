'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type PrintHydraLabelProps = {
  cDict: any;
  articleNumber: string;
  printHydraLabelAipIp: string;
  identifier: string;
  printHydraLabelAipWorkplacePosition: number;
};

export function PrintHydraLabel({
  cDict,
  articleNumber,
  printHydraLabelAipIp,
  identifier,
  printHydraLabelAipWorkplacePosition,
}: PrintHydraLabelProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (!printHydraLabelAipIp) {
      toast.error(
        cDict.printHydraLabelErrorNoConfig ||
          'Brak konfiguracji drukowania etykiety Hydra',
      );
      return;
    }

    setIsPrinting(true);
    try {
      console.log('Printing Hydra label for article:', articleNumber);
      console.log('AIP IP:', printHydraLabelAipIp);
      console.log('Identifier:', identifier);
      console.log(
        'AIP Workplace Position:',
        printHydraLabelAipWorkplacePosition,
      );

      // Use the proxy API route instead of direct connection to avoid CORS issues
      const response = await fetch('/api/dmcheck/hydra-print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          printHydraLabelAipIp, // Pass the IP to the proxy so it knows where to forward the request
          printHydraLabelAipWorkplacePosition,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to print Hydra label');
      }

      toast.success(
        cDict.printHydraLabelSuccess || 'Etykieta Hydra wysłana do druku',
      );
    } catch (error) {
      console.error('Error printing Hydra label:', error);
      toast.error(
        cDict.printHydraLabelError || 'Błąd drukowania etykiety Hydra',
      );
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className='mt-8 flex flex-col items-center justify-center'>
      <Button
        variant='destructive'
        onClick={handlePrint}
        disabled={isPrinting}
        className='flex items-center gap-2'
      >
        <Printer className='h-4 w-4' />
        {isPrinting
          ? cDict.printHydraLabelPrinting || 'Drukowanie...'
          : cDict.printHydraLabelButton || 'Drukuj etykietę Hydra'}
      </Button>
    </div>
  );
}
