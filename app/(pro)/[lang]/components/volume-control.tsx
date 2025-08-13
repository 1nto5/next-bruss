'use client';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Universal volume store for all pro apps
interface VolumeStore {
  volume: number;
  setVolume: (volume: number) => void;
}

export const useVolumeStore = create<VolumeStore>()(
  persist(
    (set) => ({
      volume: 0.75,
      setVolume: (volume) => set({ volume }),
    }),
    {
      name: 'pro-volume-storage',
    },
  ),
);

export default function VolumeControl() {
  const { volume, setVolume } = useVolumeStore();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.75);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon'>
          {volume > 0 ? <Volume2 /> : <VolumeX />}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' onClick={toggleMute}>
            {volume > 0 ? <Volume2 /> : <VolumeX />}
          </Button>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.05}
            className='flex-1'
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
