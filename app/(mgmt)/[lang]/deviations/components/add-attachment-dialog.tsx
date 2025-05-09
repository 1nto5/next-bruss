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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Paperclip, Upload } from 'lucide-react';
import { Session } from 'next-auth';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { revalidateDeviation } from '../actions';
import { DeviationStatus } from '../lib/types';
import { AttachmentFormSchema, AttachmentFormType } from '../lib/zod';

// Define attachment roles (can be imported from view.tsx or defined here)
const ATTACHMENT_ROLES = [
  'quality',
  'team-leader',
  'group-leader',
  'quality-manager',
  'production-manager',
  'plant-manager',
] as const;

interface AddAttachmentDialogProps {
  deviationId: string;
  deviationStatus: DeviationStatus | undefined;
  deviationOwner: string | undefined | null;
  session: Session | null;
}

export default function AddAttachmentDialog({
  deviationId,
  deviationStatus,
  deviationOwner,
  session,
}: AddAttachmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AttachmentFormType>({
    resolver: zodResolver(AttachmentFormSchema),
    defaultValues: {
      name: '',
      note: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      form.setValue('file', event.target.files[0], { shouldValidate: true });

      const filename = event.target.files[0].name;
      const nameWithoutExtension = filename.split('.').slice(0, -1).join('.');
      form.setValue('name', nameWithoutExtension || filename);
    }
  };

  const onSubmit = async (data: AttachmentFormType) => {
    const userRoles = session?.user?.roles || [];
    const userEmail = session?.user?.email;

    const canAddAttachment =
      deviationStatus !== 'closed' &&
      (userRoles.some((role) =>
        ATTACHMENT_ROLES.includes(role as (typeof ATTACHMENT_ROLES)[number]),
      ) ||
        userEmail === deviationOwner);

    if (!canAddAttachment) {
      toast.error('Nie masz uprawnień lub odchylenie jest zamknięte.');
      return;
    }

    if (!deviationId) {
      toast.error('Skontaktuj się z IT!');
      console.error('no deviationId');
      return;
    }

    setOpen(false);

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const formData = new FormData();
          formData.append('file', data.file);
          formData.append('deviationId', deviationId);
          if (data.name) formData.append('name', data.name);
          if (data.note) formData.append('note', data.note);

          const response = await fetch('/api/deviations/upload', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (response.ok && result.success) {
            form.reset();
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }

            revalidateDeviation();
            resolve();
          } else {
            const errorMap: { [key: string]: string } = {
              'Unauthorized': 'Brak autoryzacji',
              'No file': 'Nie wybrano pliku',
              'No deviation ID': 'Brak ID odchylenia',
              'File size exceeds the limit (10MB)':
                'Plik przekracza dozwolony rozmiar (10MB)',
              'Unsupported file type': 'Nieobsługiwany format pliku',
              'File already exists': 'Plik o tej nazwie już istnieje',
              'Failed to update deviation with attachment':
                'Nie udało się zaktualizować bazy danych',
              'Database update failed': 'Błąd aktualizacji bazy danych',
              'File upload failed': 'Błąd podczas przesyłania pliku',
            };

            if (response.status === 409) {
              reject(new Error('Ten plik już istnieje'));
            } else if (result.error && errorMap[result.error]) {
              reject(new Error(errorMap[result.error]));
            } else if (result.error) {
              console.warn('Nieprzetłumaczony błąd:', result.error);
              reject(new Error('Wystąpił błąd podczas dodawania załącznika'));
            } else {
              reject(new Error('Wystąpił nieznany błąd'));
            }
          }
        } catch (error) {
          console.error('Upload error:', error);
          reject(new Error('Wystąpił błąd podczas wysyłania pliku'));
        }
      }),
      {
        loading: 'Przesyłanie załącznika...',
        success: 'Załącznik dodany pomyślnie!',
        error: (err) => err.message,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Upload className='' />
          Dodaj
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Dodaj załącznik</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* <DialogScrollArea> */}
            {/* <DialogFormWithScroll> */}
            <FormField
              control={form.control}
              name='file'
              render={({ field: { onChange, value, ref, ...rest } }) => (
                <FormItem>
                  <FormLabel htmlFor='file'>Plik</FormLabel>
                  <FormControl>
                    <Input
                      id='file'
                      type='file'
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor='name'>Nazwa</FormLabel>
                  <FormControl>
                    <Input
                      id='name'
                      placeholder='Własna nazwa pliku'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor='note'>Notatka</FormLabel>
                  <FormControl>
                    <Textarea id='note' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </DialogFormWithScroll> */}
            {/* </DialogScrollArea> */}
            <DialogFooter className='mt-4'>
              {/* <Button
                variant='outline'
                type='button'
                onClick={() => setOpen(false)}
              >
                Anuluj
              </Button> */}
              <Button type='submit' disabled={isUploading}>
                <Paperclip className={isUploading ? 'animate-spin' : ''} />
                Dodaj załącznik
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
