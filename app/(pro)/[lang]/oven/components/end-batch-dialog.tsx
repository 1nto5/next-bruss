import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import { RefObject, memo } from 'react';

interface EndBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scannedBatch: string;
  setScannedBatch: (val: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  onEnd: () => Promise<void>;
  loading?: boolean;
  error?: string | null; // Add error prop
  onErrorClear?: () => void; // Add error clear callback
}

// Dialog for ending a HYDRA batch process
// Memoized to prevent unnecessary re-renders when parent state changes
export const EndBatchDialog = memo<EndBatchDialogProps>(
  function EndBatchDialog({
    open,
    onOpenChange,
    scannedBatch,
    setScannedBatch,
    inputRef,
    onEnd,
    loading,
    error,
    onErrorClear,
  }) {
    const handleInputChange = (value: string) => {
      setScannedBatch(value);
      // Clear error when user starts typing/scanning
      if (error && onErrorClear) {
        onErrorClear();
      }
    };

    const handleDialogClose = (open: boolean) => {
      onOpenChange(open);
      setScannedBatch('');
      // Clear error when dialog closes
      if (error && onErrorClear) {
        onErrorClear();
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Zakończ proces</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Input
                value={scannedBatch}
                onChange={(e) => handleInputChange(e.target.value)}
                className='text-center'
                placeholder='Zeskanuj HYDRA batch...'
                autoFocus
                ref={inputRef}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    await onEnd();
                  }
                }}
              />

              {/* Persistent error display */}
              {error && (
                <Alert variant='destructive' className='mt-2'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={() => handleDialogClose(false)}
                className='flex-1'
                variant='outline'
                disabled={loading}
              >
                Anuluj
              </Button>
              <Button
                onClick={onEnd}
                className='flex-1'
                disabled={!scannedBatch || loading}
              >
                {loading ? 'Kończenie...' : 'Zakończ'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
