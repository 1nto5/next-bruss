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
import { RefObject, memo, useEffect } from 'react';

interface StartBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scannedArticle: string;
  setScannedArticle: (val: string) => void;
  scannedBatch: string;
  setScannedBatch: (val: string) => void;
  articleInputRef: RefObject<HTMLInputElement>;
  batchInputRef: RefObject<HTMLInputElement>;
  onStart: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

// Dialog for starting a new HYDRA batch process
// Memoized to prevent unnecessary re-renders when parent state changes
export const StartBatchDialog = memo<StartBatchDialogProps>(
  function StartBatchDialog({
    open,
    onOpenChange,
    scannedArticle,
    setScannedArticle,
    scannedBatch,
    setScannedBatch,
    articleInputRef,
    batchInputRef,
    onStart,
    loading,
    error,
    onErrorClear,
  }) {
    // When dialog opens, focus article field
    useEffect(() => {
      if (open && articleInputRef.current) {
        setTimeout(() => articleInputRef.current?.focus(), 50);
      }
    }, [open, articleInputRef]);

    const handleArticleChange = (value: string) => {
      setScannedArticle(value);
      if (error && onErrorClear) onErrorClear();
    };
    const handleBatchChange = (value: string) => {
      setScannedBatch(value);
      if (error && onErrorClear) onErrorClear();
    };
    const handleDialogClose = (open: boolean) => {
      onOpenChange(open);
      setScannedArticle('');
      setScannedBatch('');
      if (error && onErrorClear) onErrorClear();
    };
    // Helper to start process and refocus article field
    const handleStartAndRefocus = async () => {
      await onStart();
      setTimeout(() => articleInputRef.current?.focus(), 50);
    };
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Nowy proces</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Input
                value={scannedArticle}
                onChange={(e) => handleArticleChange(e.target.value)}
                className='text-center'
                placeholder='Zeskanuj numer artykułu...'
                autoFocus
                ref={articleInputRef}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (scannedArticle && batchInputRef.current) {
                      setTimeout(() => batchInputRef.current?.focus(), 50);
                    }
                  }
                }}
              />
              <Input
                value={scannedBatch}
                onChange={(e) => handleBatchChange(e.target.value)}
                className='text-center'
                placeholder='Zeskanuj HYDRA batch...'
                ref={batchInputRef}
                disabled={!scannedArticle}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && scannedArticle && scannedBatch) {
                    e.preventDefault();
                    await handleStartAndRefocus();
                  }
                }}
              />
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
                onClick={handleStartAndRefocus}
                className='flex-1'
                disabled={!scannedArticle || !scannedBatch || loading}
              >
                {loading ? 'Rozpoczynanie...' : 'Rozpocznij'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);
