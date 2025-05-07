'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { StickyNote } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { addNote, revalidateDeviation } from '../actions';
import { NoteFormSchema, NoteFormType } from '../lib/zod';

interface AddNoteDialogProps {
  deviationId: string;
}

export default function AddNoteDialog({ deviationId }: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NoteFormType>({
    resolver: zodResolver(NoteFormSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: NoteFormType) => {
    if (!deviationId) {
      toast.error('Błąd ID odchylenia. Skontaktuj się z IT!');
      return;
    }

    setIsSubmitting(true);

    // Close dialog immediately for better UX
    setOpen(false);

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const result = await addNote(deviationId, data.content);

          if (result.success) {
            form.reset();
            revalidateDeviation();
            resolve();
          } else {
            reject(
              new Error(
                result.error || 'Wystąpił błąd podczas dodawania notatki',
              ),
            );
          }
        } catch (error) {
          console.error('Note submission error:', error);
          reject(new Error('Wystąpił nieznany błąd'));
        } finally {
          setIsSubmitting(false);
        }
      }),
      {
        loading: 'Dodawanie notatki...',
        success: 'Notatka dodana pomyślnie!',
        error: (err) => err.message,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <StickyNote className='' />
          Dodaj
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Dodaj notatkę</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor='content'>Treść notatki</FormLabel>
                  <FormControl>
                    <Textarea
                      id='content'
                      placeholder='Wprowadź treść notatki...'
                      className='h-32'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='mt-4'>
              <Button type='submit' disabled={isSubmitting}>
                <StickyNote className='mr-2 h-4 w-4' />
                Dodaj notatkę
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
