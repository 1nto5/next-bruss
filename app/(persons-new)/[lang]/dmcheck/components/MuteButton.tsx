'use client';
import { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Drum } from 'lucide-react'; // Removed unused import of VolumeX
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function MuteButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const volume = searchParams.get('volume');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
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
