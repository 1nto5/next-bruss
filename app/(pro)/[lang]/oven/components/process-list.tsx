'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, QrCode, ScanLine } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  completeOvenProcess,
  createOvenProcess,
  startOvenProcess,
  validateBatchNumber,
} from '../actions';
import { useGetOvenProcesses } from '../data/get-oven-processes';
import { useOvenStore, usePersonalNumberStore } from '../lib/stores';

const newProcessSchema = z.object({
  batchNumber: z
    .string()
    .min(3, { message: 'Numer partii musi mieć minimum 3 znaki!' }),
});

interface ProcessType {
  id: string;
  ovenId: string;
  batchNumber: string;
  operators: string[];
  status: 'pending' | 'running' | 'completed';
  createdAt: Date;
  startTime?: Date;
  endTime?: Date;
  temperature?: number;
  notes?: string;
}

export default function ProcessList() {
  const { selectedOven } = useOvenStore();
  const { personalNumber1, personalNumber2, personalNumber3 } =
    usePersonalNumberStore();
  const [showNewProcessDialog, setShowNewProcessDialog] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const operators = [personalNumber1, personalNumber2, personalNumber3].filter(
    (person) => person,
  );

  const { data, error, refetch, isFetching } =
    useGetOvenProcesses(selectedOven);

  const form = useForm<z.infer<typeof newProcessSchema>>({
    resolver: zodResolver(newProcessSchema),
    defaultValues: {
      batchNumber: '',
    },
  });

  const handleKeypadNumber = (character: string) => {
    const currentValue = form.getValues('batchNumber') || '';
    form.setValue('batchNumber', currentValue + character);
  };

  const handleKeypadBackspace = () => {
    const currentValue = form.getValues('batchNumber') || '';
    form.setValue('batchNumber', currentValue.slice(0, -1));
  };

  const handleKeypadClear = () => {
    form.setValue('batchNumber', '');
  };

  const onSubmitNewProcess = async (data: z.infer<typeof newProcessSchema>) => {
    setIsPending(true);
    try {
      // Validate batch number first
      const validationResult = await validateBatchNumber(data.batchNumber);
      if (validationResult.error) {
        switch (validationResult.error) {
          case 'invalid_batch':
            form.setError('batchNumber', {
              message: 'Nieprawidłowy numer partii!',
            });
            break;
          case 'batch_too_short':
            form.setError('batchNumber', {
              message: 'Numer partii jest za krótki!',
            });
            break;
          default:
            toast.error('Błąd walidacji numeru partii!');
        }
        return;
      }

      // Create process
      const result = await createOvenProcess(
        selectedOven,
        validationResult.batchInfo!.batchNumber,
        operators,
      );

      if (result.error) {
        switch (result.error) {
          case 'batch_already_exists':
            form.setError('batchNumber', {
              message: 'Proces dla tej partii już istnieje!',
            });
            break;
          default:
            toast.error('Nie udało się utworzyć procesu!');
        }
      } else if (result.success) {
        toast.success('Proces został utworzony!');
        setShowNewProcessDialog(false);
        form.reset();
        refetch();
      }
    } catch (error) {
      console.error('onSubmitNewProcess', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  const handleStartProcess = async (processId: string) => {
    // For demo, using default temperature of 180°C
    const result = await startOvenProcess(processId, 180);
    if (result.success) {
      toast.success('Proces został uruchomiony!');
      refetch();
    } else {
      toast.error('Nie udało się uruchomić procesu!');
    }
  };

  const handleCompleteProcess = async (processId: string) => {
    const result = await completeOvenProcess(processId);
    if (result.success) {
      toast.success('Proces został zakończony!');
      refetch();
    } else {
      toast.error('Nie udało się zakończyć procesu!');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Oczekuje';
      case 'running':
        return 'W trakcie';
      case 'completed':
        return 'Zakończony';
      default:
        return status;
    }
  };

  if (error) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Błąd</CardTitle>
          <CardDescription>
            Wystąpił błąd podczas ładowania procesów.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-2xl'>
                  Procesy pieca {selectedOven}
                </CardTitle>
                <CardDescription>
                  Operatorzy: {operators.join(', ')}
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowNewProcessDialog(true)}
                size='lg'
                className='gap-2'
              >
                <Plus className='h-5 w-5' />
                Nowy proces
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isFetching && !data?.success ? (
              <Skeleton className='h-96 w-full' />
            ) : data?.success && data.success.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numer partii</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Utworzono</TableHead>
                    <TableHead>Czas rozpoczęcia</TableHead>
                    <TableHead>Temperatura</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.success as ProcessType[]).map((process) => (
                    <TableRow key={process.id}>
                      <TableCell className='font-mono font-medium'>
                        {process.batchNumber}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(process.status)}`}
                        >
                          {getStatusText(process.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(process.createdAt).toLocaleString('pl-PL')}
                      </TableCell>
                      <TableCell>
                        {process.startTime
                          ? new Date(process.startTime).toLocaleString('pl-PL')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {process.temperature ? `${process.temperature}°C` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          {process.status === 'pending' && (
                            <Button
                              onClick={() => handleStartProcess(process.id)}
                              size='sm'
                              variant='outline'
                            >
                              Uruchom
                            </Button>
                          )}
                          {process.status === 'running' && (
                            <Button
                              onClick={() => handleCompleteProcess(process.id)}
                              size='sm'
                              variant='outline'
                            >
                              Zakończ
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className='py-8 text-center'>
                <ScanLine className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                <p className='text-muted-foreground text-lg'>
                  Brak procesów dla tego pieca
                </p>
                <p className='text-muted-foreground text-sm'>
                  Kliknij "Nowy proces" aby rozpocząć
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Process Dialog */}
      <Dialog
        open={showNewProcessDialog}
        onOpenChange={setShowNewProcessDialog}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <QrCode className='h-5 w-5' />
              Nowy proces termiczny
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitNewProcess)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='batchNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numer partii</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Dotknij aby wprowadzić'
                        onFocus={() => setShowKeypad(true)}
                        readOnly
                        className='text-center font-mono text-lg'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-between gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setShowNewProcessDialog(false);
                    form.reset();
                  }}
                  className='flex-1'
                >
                  Anuluj
                </Button>
                {isPending ? (
                  <Button disabled className='flex-1'>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Tworzenie
                  </Button>
                ) : (
                  <Button type='submit' className='flex-1'>
                    Utwórz proces
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Numeric Keypad Dialog */}
      <Dialog open={showKeypad} onOpenChange={setShowKeypad}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Wprowadź numer partii</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='text-center'>
              <Input
                value={form.getValues('batchNumber') || ''}
                readOnly
                className='text-center font-mono text-2xl'
                placeholder='Numer partii'
              />
            </div>

            <Button
              onClick={() => setShowKeypad(false)}
              className='w-full'
              variant='outline'
            >
              Zamknij
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
