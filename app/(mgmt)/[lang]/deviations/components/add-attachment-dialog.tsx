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
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { revalidateDeviation } from '../actions';
import { AttachmentFormSchema, AttachmentFormType } from '../lib/zod';

interface AddAttachmentDialogProps {
  deviationId: string;
}

export default function AddAttachmentDialog({
  deviationId,
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

      // Pre-fill custom name with the original filename (without extension)
      const filename = event.target.files[0].name;
      const nameWithoutExtension = filename.split('.').slice(0, -1).join('.');
      form.setValue('name', nameWithoutExtension || filename);
    }
  };

  const onSubmit = async (data: AttachmentFormType) => {
    if (!deviationId) {
      toast.error('Błąd ID odchylenia. Skontaktuj się z IT!');
      return;
    }

    setIsUploading(true);

    try {
      // Przygotowanie danych FormData do wysyłki
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('deviationId', deviationId);
      if (data.name) formData.append('name', data.name);
      if (data.note) formData.append('note', data.note);

      // Wywołanie API zamiast server action
      const response = await fetch('/api/deviations/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Załącznik dodany pomyślnie!');
        form.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setOpen(false);
        // Odświeżenie danych
        revalidateDeviation();
      } else {
        // Mapowanie angielskich błędów API na polskie komunikaty dla użytkownika
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

        // Obsługa konkretnych błędów na podstawie statusu
        if (response.status === 409) {
          toast.error('Ten plik już istnieje');
        } else if (result.error && errorMap[result.error]) {
          // Wyświetl przetłumaczony komunikat błędu
          toast.error(errorMap[result.error]);
        } else if (result.error) {
          // Wyświetl oryginalny komunikat błędu, gdy nie ma tłumaczenia
          console.warn('Nieprzetłumaczony błąd:', result.error);
          toast.error('Wystąpił błąd podczas dodawania załącznika');
        } else {
          toast.error('Wystąpił nieznany błąd');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Wystąpił błąd podczas wysyłania pliku');
    } finally {
      setIsUploading(false);
    }
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
