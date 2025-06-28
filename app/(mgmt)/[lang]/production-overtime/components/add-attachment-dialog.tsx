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
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Paperclip } from 'lucide-react';
import { Session } from 'next-auth';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { revalidateProductionOvertime as revalidate } from '../actions';
import { OvertimeStatus } from '../lib/types';
import { AttachmentFormSchema, AttachmentFormType } from '../lib/zod';

// Update the attachment roles to match the specified requirements
const ATTACHMENT_ROLES = [
  'group-leader',
  'production-manager',
  'plant-manager',
  'hr',
] as const;

interface AddAttachmentDialogProps {
  id: string;
  status: OvertimeStatus;
  owner: string | undefined | null;
  responsibleEmployee: string | undefined | null;
  session: Session | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddAttachmentDialog({
  id,
  owner,
  responsibleEmployee,
  session,
  isOpen,
  onOpenChange,
}: AddAttachmentDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AttachmentFormType>({
    resolver: zodResolver(AttachmentFormSchema),
    defaultValues: {},
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      form.setValue('file', event.target.files[0], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: AttachmentFormType) => {
    const userRoles = session?.user?.roles || [];
    const userEmail = session?.user?.email;

    // Check if user is the request owner, responsible employee, or has one of the allowed roles
    const canAddAttachment =
      userRoles.some((role) =>
        ATTACHMENT_ROLES.includes(role as (typeof ATTACHMENT_ROLES)[number]),
      ) ||
      userEmail === owner ||
      userEmail === responsibleEmployee;

    if (!canAddAttachment) {
      toast.error('Nie masz uprawnień do dodania listy obecności.');
      return;
    }

    if (!id) {
      toast.error('Skontaktuj się z IT!');
      console.error('no overTimeRequestId');
      return;
    }

    onOpenChange(false);
    setIsUploading(true);

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const formData = new FormData();
          formData.append('file', data.file);
          formData.append('overTimeRequestId', id);

          const response = await fetch('/api/production-overtime/upload', {
            method: 'POST',
            body: formData,
          });

          // For debugging, log the full response
          const responseText = await response.text();

          // Parse the response text as JSON
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            reject(new Error('Nieprawidłowa odpowiedź z serwera'));
            return;
          }

          if (response.ok && result.success) {
            form.reset();
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }

            // Ensure we revalidate the data
            await revalidate();
            resolve();
          } else {
            const errorMap: { [key: string]: string } = {
              'Unauthorized': 'Brak autoryzacji',
              'Insufficient permissions to add attachment':
                'Brak uprawnień do dodania załącznika',
              'No file': 'Nie wybrano pliku',
              'No overTimeRequest ID': 'Brak ID odchylenia',
              'File size exceeds the limit (10MB)':
                'Plik przekracza dozwolony rozmiar (10MB)',
              'Unsupported file type': 'Nieobsługiwany format pliku',
              'File already exists': 'Plik o tej nazwie już istnieje',
              'Failed to update overTimeRequest with attachment':
                'Nie udało się zaktualizować bazy danych',
              'Database update failed': 'Błąd aktualizacji bazy danych',
              'File upload failed': 'Błąd podczas przesyłania pliku',
            };

            if (response.status === 409) {
              reject(new Error('Ten plik już istnieje'));
            } else if (response.status === 403) {
              reject(new Error('Brak uprawnień do dodania załącznika'));
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
        } finally {
          setIsUploading(false);
        }
      }),
      {
        loading: 'Przesyłanie listy obecności...',
        success:
          'Lista obecności dodana pomyślnie! Status zlecenia zmieniony na zamknięty.',
        error: (err) => err.message,
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Dodaj listę obecności</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Dodanie listy obecności jest równoznaczne z potwierdzeniem wykonania
          zlecenia oraz zmiani jego statusu na zamknięty.
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='file'
              render={({ field: { onChange, value, ref, ...rest } }) => (
                <FormItem>
                  <FormLabel htmlFor='file'>Lista obecności</FormLabel>
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
            <DialogFooter className='mt-4'>
              <Button type='submit' disabled={isUploading}>
                <Paperclip className={isUploading ? 'animate-spin' : 'mr-2'} />
                Dodaj listę obecności
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
