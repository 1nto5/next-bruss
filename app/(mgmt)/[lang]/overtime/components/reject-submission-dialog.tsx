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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Session } from 'next-auth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { rejectOvertimeSubmission } from '../actions';

const RejectSchema = z.object({
  rejectionReason: z
    .string()
    .min(1, 'Powód odrzucenia jest wymagany!')
    .max(500, 'Powód odrzucenia nie może być dłuższy niż 500 znaków!'),
});

type RejectFormType = z.infer<typeof RejectSchema>;

type RejectSubmissionDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  session: Session | null;
};

export default function RejectSubmissionDialog({
  isOpen,
  onOpenChange,
  submissionId,
  session,
}: RejectSubmissionDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<RejectFormType>({
    resolver: zodResolver(RejectSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  const onSubmit = async (data: RejectFormType) => {
    setIsPending(true);
    try {
      const res = await rejectOvertimeSubmission(
        submissionId,
        data.rejectionReason,
      );
      if ('success' in res) {
        toast.success('Zgłoszenie zostało odrzucone!');
        form.reset();
        onOpenChange(false);
      } else if ('error' in res) {
        console.error(res.error);
        toast.error('Wystąpił błąd podczas odrzucania!');
      }
    } catch (error) {
      console.error('Reject submission error:', error);
      toast.error('Wystąpił błąd podczas odrzucania!');
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Odrzuć zgłoszenie</DialogTitle>
          <DialogDescription>
            Podaj powód odrzucenia zgłoszenia godzin nadliczbowych.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='rejectionReason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Powód odrzucenia</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Wpisz powód odrzucenia...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                disabled={isPending}
              >
                Anuluj
              </Button>
              <Button type='submit' variant='destructive' disabled={isPending}>
                {isPending ? 'Odrzucanie...' : 'Odrzuć zgłoszenie'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
