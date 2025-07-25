'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Table, X } from 'lucide-react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { revalidateProductionOvertime as revalidate } from '../actions';
import { OvertimeType } from '../lib/types';
import {
  MultipleAttachmentFormSchema,
  MultipleAttachmentFormType,
} from '../lib/zod';
import { MultiArticleManager } from './multi-article-manager';

// Update the attachment roles to match the specified requirements
const ATTACHMENT_ROLES = [
  'group-leader',
  'production-manager',
  'plant-manager',
  'hr',
] as const;

interface CompleteOrderFormProps {
  id: string;
  session: Session | null;
  overtimeRequest: OvertimeType;
}

export default function CompleteOrderForm({
  id,
  session,
  overtimeRequest,
}: CompleteOrderFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<MultipleAttachmentFormType>({
    resolver: zodResolver(MultipleAttachmentFormSchema),
    defaultValues: {
      files: [],
      mergeFiles: true,
      actualArticles: overtimeRequest.plannedArticles || [],
      actualEmployeesWorked: undefined,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(filesArray);
      form.setValue('files', filesArray, { shouldValidate: true });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    form.setValue('files', newFiles, { shouldValidate: true });

    // Reset the input if no files remain
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onSubmit = async (data: MultipleAttachmentFormType) => {
    const userRoles = session?.user?.roles || [];
    const userEmail = session?.user?.email;

    // Check if user is the request owner, responsible employee, or has one of the allowed roles
    const canAddAttachment =
      userRoles.some((role: string) =>
        ATTACHMENT_ROLES.includes(role as (typeof ATTACHMENT_ROLES)[number]),
      ) ||
      userEmail === overtimeRequest.requestedBy ||
      userEmail === overtimeRequest.responsibleEmployee;

    if (!canAddAttachment) {
      toast.error('Nie masz uprawnień do dodania listy obecności.');
      return;
    }

    if (!id) {
      toast.error('Skontaktuj się z IT!');
      console.error('no overTimeRequestId');
      return;
    }

    setIsUploading(true);

    toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const formData = new FormData();

          // Add all files to FormData
          data.files.forEach((file: File) => {
            formData.append('files', file);
          });

          formData.append('overTimeRequestId', id);
          formData.append('mergeFiles', data.mergeFiles.toString());

          // Add the actual articles data
          if (data.actualArticles && data.actualArticles.length > 0) {
            formData.append(
              'actualArticles',
              JSON.stringify(data.actualArticles),
            );
          }
          if (data.actualEmployeesWorked !== undefined) {
            formData.append(
              'actualEmployeesWorked',
              data.actualEmployeesWorked.toString(),
            );
          }

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
            setSelectedFiles([]);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }

            // Ensure we revalidate the data
            await revalidate();

            // Navigate back to the production overtime list
            router.push(`/production-overtime`);
            resolve();
          } else {
            const errorMap: { [key: string]: string } = {
              'Unauthorized': 'Brak autoryzacji',
              'Insufficient permissions to add attachment':
                'Brak uprawnień do dodania załącznika',
              'No files': 'Nie wybrano plików',
              'No overTimeRequest ID': 'Brak ID zlecenia',
              'File size exceeds the limit (10MB)':
                'Jeden z plików przekracza dozwolony rozmiar (10MB)',
              'Total file size exceeds the limit (50MB)':
                'Łączny rozmiar plików przekracza dozwolony limit (50MB)',
              'Unsupported file type': 'Nieobsługiwany format pliku',
              'File already exists': 'Plik o tej nazwie już istnieje',
              'Failed to update overTimeRequest with attachments':
                'Nie udało się zaktualizować bazy danych',
              'Database update failed': 'Błąd aktualizacji bazy danych',
              'File upload failed': 'Błąd podczas przesyłania plików',
            };

            if (response.status === 409) {
              reject(new Error('Jeden z plików już istnieje'));
            } else if (response.status === 403) {
              reject(new Error('Brak uprawnień do dodania załączników'));
            } else if (result.error && errorMap[result.error]) {
              reject(new Error(errorMap[result.error]));
            } else if (result.error) {
              console.warn('Nieprzetłumaczony błąd:', result.error);
              reject(new Error('Wystąpił błąd podczas dodawania załączników'));
            } else {
              reject(new Error('Wystąpił nieznany błąd'));
            }
          }
        } catch (error) {
          console.error('Upload error:', error);
          reject(new Error('Wystąpił błąd podczas wysyłania plików'));
        } finally {
          setIsUploading(false);
        }
      }),
      {
        loading: 'Przesyłanie plików...',
        success: (data) => {
          const count = selectedFiles.length;
          return `Zlecenie zamknięte pomyślnie! ${count} ${count === 1 ? 'plik przesłany oraz przekonwertowany do PDF' : 'pliki przesłane oraz scalone do pliku PDF'}. Status zlecenia zmieniony na ukończony.`;
        },
        error: (err) => err.message,
      },
    );
  };

  return (
    <Card className='sm:w-[768px]'>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>Zamykanie zlecenia</CardTitle>
          <Link href={`/production-overtime`}>
            <Button variant='outline'>
              <Table /> <span>Powrót do listy zleceń</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Separator className='mb-4' />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-6'>
            <p className='text-muted-foreground text-sm'>
              Zamykanie zlecenia obejmuje przesłanie listy obecności oraz
              podanie rzeczywistej liczby pracowników i wyprodukowanych
              artykułów. Po zamknięciu status zlecenia zmieni się na ukończony.
            </p>

            <FormField
              control={form.control}
              name='files'
              render={({ field: { onChange, value, ref, ...rest } }) => (
                <FormItem>
                  <FormLabel htmlFor='files'>Lista obecności</FormLabel>
                  <FormControl>
                    <Input
                      id='files'
                      type='file'
                      multiple
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept='image/*,image/heic,image/heif,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar'
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display selected files */}
            {selectedFiles.length > 0 && (
              <div className='space-y-2'>
                <Label>Wybrane pliki ({selectedFiles.length}):</Label>
                <div className='max-h-40 space-y-2 overflow-y-auto'>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className='bg-muted flex items-center justify-between rounded-md p-2'
                    >
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>
                          {file.name}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeFile(index)}
                        className='h-6 w-6 p-0'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actual results fields */}
            <FormField
              control={form.control}
              name='actualArticles'
              render={({ field }) => (
                <>
                  <MultiArticleManager
                    value={field.value || []}
                    onChange={field.onChange}
                    label='Zrealizowana produkcja'
                    initialValues={overtimeRequest.plannedArticles || []}
                  />
                  <FormMessage />
                </>
              )}
            />

            <FormField
              control={form.control}
              name='actualEmployeesWorked'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Rzeczywista liczba pracowników (planowano:{' '}
                    {overtimeRequest.numberOfEmployees})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      step={1}
                      {...field}
                      onChange={(e) => {
                        const value =
                          e.target.value === ''
                            ? undefined
                            : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <Separator className='mb-4' />

          <CardFooter className='flex justify-end'>
            <Button
              type='submit'
              disabled={isUploading || selectedFiles.length === 0}
              className='w-full sm:w-auto'
            >
              <CheckCircle className={isUploading ? 'animate-spin' : ''} />
              Zamknij zlecenie
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
