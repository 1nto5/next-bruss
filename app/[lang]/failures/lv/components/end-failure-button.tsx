'use client';

import { Button } from '@/components/ui/button';

import { Wrench } from 'lucide-react';

// import { Separator } from '@/components/ui/separator';

import { toast } from 'sonner';

import { endFailure } from '../actions';

export default function EndFailureButton({ failureId }: { failureId: string }) {
  const handleOnClick = async () => {
    // setIsDraft(false);
    // setIsPendingUpdate(true);
    try {
      const res = await endFailure(failureId);
      if (res.success) {
        toast.success('Awaria zakończona!');
      } else if (res.error) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      // setIsPendingUpdate(false);
      // form.reset();
      // setOpen(false);
    }
  };

  return (
    <Button size={'sm'} onClick={handleOnClick}>
      <Wrench />
      Zakończ
    </Button>
  );
}
