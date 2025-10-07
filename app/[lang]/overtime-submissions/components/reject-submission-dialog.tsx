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
  const form = useForm<RejectFormType>({
    resolver: zodResolver(RejectSchema),
    defaultValues: {
      rejectionReason: '',
    },
  });

  const onSubmit = async (data: RejectFormType) => {
    toast.promise(
      rejectOvertimeSubmission(submissionId, data.rejectionReason).then(
        (res) => {
          if (res.error) {
            throw new Error(res.error);
          }
          return res;
        },
      ),
      {
        loading: 'Odrzucanie zgłoszenia...',
        success: 'Zgłoszenie zostało odrzucone!',
        error: (error) => {
          const errorMsg = error.message;
          if (errorMsg === 'unauthorized')
            return 'Nie masz uprawnień do odrzucania!';
          if (errorMsg === 'not found') return 'Nie znaleziono zgłoszenia!';
          console.error('onSubmit', errorMsg);
          return 'Skontaktuj się z IT!';
        },
      },
    );
    form.reset();
    onOpenChange(false);
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
            Podaj powód odrzucenia zgłoszenia nadgodzin.
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
              <Button type='button' variant='outline' onClick={handleCancel}>
                Anuluj
              </Button>
              <Button type='submit' variant='destructive'>
                Odrzuć zgłoszenie
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
