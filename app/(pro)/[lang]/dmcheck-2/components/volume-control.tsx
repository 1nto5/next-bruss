'use client';

import { ProButton } from '@/app/(pro)/components/ui/pro-button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX } from 'lucide-react';
import { useVolumeStore } from '../lib/stores';

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
        <ProButton variant="ghost" size="icon" className="h-12 w-12">
          {volume > 0 ? (
            <Volume2 className="h-6 w-6" />
          ) : (
            <VolumeX className="h-6 w-6" />
          )}
        </ProButton>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-6">
        <div className="flex items-center gap-6">
          <ProButton
            variant="ghost"
            size="icon"
            className="h-14 w-14 flex-shrink-0"
            onClick={toggleMute}
          >
            {volume > 0 ? (
              <Volume2 className="h-8 w-8" />
            ) : (
              <VolumeX className="h-8 w-8" />
            )}
          </ProButton>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.05}
            className="flex-1 [&_[role=slider]]:h-8 [&_[role=slider]]:w-8"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}