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
import { rejectOvertimeSubmission } from '../actions/approval';
import { Dictionary } from '../lib/dict';

type RejectSubmissionDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  session: Session | null;
  dict: Dictionary;
};

export default function RejectSubmissionDialog({
  isOpen,
  onOpenChange,
  submissionId,
  session,
  dict,
}: RejectSubmissionDialogProps) {
  const RejectSchema = z.object({
    rejectionReason: z
      .string()
      .min(1, dict.validation.rejectionReasonRequired)
      .max(500, dict.validation.rejectionReasonTooLong),
  });

  type RejectFormType = z.infer<typeof RejectSchema>;

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
        loading: dict.toast.rejecting,
        success: dict.toast.rejected,
        error: (error) => {
          const errorMsg = error.message;
          if (errorMsg === 'unauthorized') return dict.errors.unauthorizedToReject;
          if (errorMsg === 'not found') return dict.errors.notFound;
          console.error('onSubmit', errorMsg);
          return dict.errors.contactIT;
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
          <DialogTitle>{dict.dialogs.reject.title}</DialogTitle>
          <DialogDescription>
            {dict.dialogs.reject.description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='rejectionReason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.dialogs.reject.reasonLabel}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={dict.dialogs.reject.reasonPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleCancel}>
                {dict.actions.cancel}
              </Button>
              <Button type='submit' variant='destructive'>
                {dict.dialogs.reject.buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
