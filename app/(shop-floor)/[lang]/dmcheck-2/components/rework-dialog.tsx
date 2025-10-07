'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import type { Dictionary } from '../lib/dict';

interface ReworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRework: boolean;
  onReworkChange: (isRework: boolean) => void;
  dict: Dictionary;
}

export default function ReworkDialog({
  open,
  onOpenChange,
  isRework,
  onReworkChange,
  dict,
}: ReworkDialogProps) {
  const [tempRework, setTempRework] = useState(isRework);

  useEffect(() => {
    setTempRework(isRework);
  }, [isRework, open]);

  const handleSave = () => {
    onReworkChange(tempRework);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempRework(isRework);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.scan.reworkDialog.title}</DialogTitle>
          <DialogDescription>
            {dict.scan.reworkDialog.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Switch 
            checked={tempRework} 
            onCheckedChange={setTempRework} 
            id="rework-dialog" 
          />
          <Label htmlFor="rework-dialog">
            {dict.scan.reworkDialog.enableLabel}
          </Label>
        </div>
        <DialogFooter className='flex w-full flex-row gap-2'>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className='flex w-1/3 items-center justify-center gap-2'
          >
            {dict.scan.reworkDialog.cancel}
          </Button>
          <Button 
            onClick={handleSave}
            className='flex w-2/3 items-center justify-center gap-2'
          >
            {dict.scan.reworkDialog.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}