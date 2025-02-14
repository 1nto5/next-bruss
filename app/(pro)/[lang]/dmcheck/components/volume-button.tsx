'use client';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Drum } from 'lucide-react'; // Removed unused import of VolumeX
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function VolumeButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const volume = searchParams?.get('volume');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const handleSliderChange = (values: number[]) => {
    router.push(
      pathname + '?' + createQueryString('volume', String(values[0] / 100)),
    );
  };

  if (!volume) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon'>
          <Drum className='h-[1.2rem] w-[1.2rem]' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-60'>
        <Slider
          onValueChange={handleSliderChange}
          defaultValue={volume ? [parseFloat(volume) * 100] : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
