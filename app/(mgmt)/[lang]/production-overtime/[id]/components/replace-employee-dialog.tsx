'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  ChevronsUpDown,
  CircleX,
  Command,
  Pencil,
  Save,
} from 'lucide-react';

// import { Separator } from '@/components/ui/separator';
import DialogFormWithScroll from '@/components/dialog-form-with-scroll';
import DialogScrollArea from '@/components/dialog-scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/cn';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'cmdk';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { replaceEmployee } from '../../actions';

export default function ReplaceEmployeeDialog({
  overtimeId,
  currentEmployeeArrayPosition,
}: {
  overtimeId: string;
  currentEmployeeArrayPosition: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<null | {
    firstName: string;
    lastName: string;
    identifier: string;
  }>(null);

  const replaceEmployeeSchema = z
    .object({
      employee: z.object({
        firstName: z.string(),
        lastName: z.string(),
        identifier: z.string(),
      }),
      isDayOffAgreed: z.boolean().default(true),
      date: z.date({ message: 'Wybierz datę odbioru!' }).optional(),
      note: z.string().optional().default(''),
    })
    .superRefine((data, ctx) => {
      if (data.isDayOffAgreed && data.date === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Wybierz datę odbioru!',
          path: ['date'],
        });
      }
    });
  const form = useForm<z.infer<typeof replaceEmployeeSchema>>({
    resolver: zodResolver(replaceEmployeeSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (open) {
      form.reset();
      setSelectedEmployee(null);
      setInputValue('');
    }
  }, [open, form]);

  const handleSelect = (employee: {
    firstName: string;
    lastName: string;
    identifier: string;
  }) => {
    setSelectedEmployee(employee);
    form.setValue('employee', employee);
    setPopoverOpen(false);
  };

  const onSubmit = async (data: z.infer<typeof replaceEmployeeSchema>) => {
    // setIsDraft(false);
    setIsPendingUpdate(true);
    try {
      const res = await replaceEmployee(
        overtimeId,
        currentEmployeeArrayPosition,
        {
          ...data.employee,
          agreedReceivingAt: data.date,
          note: data.note,
        },
      );
      if (res.success) {
        toast.success('Pracownik zmieniony!');
      } else if (res.error === 'unauthorized') {
        toast.error('Nie masz uprawnień do tej operacji!');
      } else if (res.error) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingUpdate(false);
      form.reset();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Button size={'sm'} variant={'outline'}>
            <Pencil />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Edycja awarii</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogScrollArea>
              <DialogFormWithScroll>
                <Popover
                  open={popoverOpen}
                  onOpenChange={setPopoverOpen}
                  modal={true}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className='w-full justify-between'
                    >
                      <span className={cn(!selectedEmployee && 'opacity-50')}>
                        {selectedEmployee
                          ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} (${selectedEmployee.identifier})`
                          : 'Wybierz pracownika...'}
                      </span>
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='p-0' side='bottom' align='start'>
                    <Command>
                      <CommandInput
                        placeholder='Szukaj pracownika...'
                        value={inputValue}
                        onValueChange={setInputValue}
                      />
                      <CommandList>
                        <CommandEmpty>Nie znaleziono pracowników.</CommandEmpty>
                        <CommandGroup>
                          {selectedEmployee && (
                            <CommandItem
                              key='reset'
                              onSelect={() => {
                                setSelectedEmployee(null);
                                form.setValue('employee', undefined as any);
                              }}
                            >
                              <CircleX className='mr-2 h-4 w-4 text-red-500' />
                              usuń wybór
                            </CommandItem>
                          )}
                          {employees.map((employee) => (
                            <CommandItem
                              key={employee.identifier}
                              value={`${employee.identifier}${employee.firstName}${employee.lastName}`}
                              onSelect={() => handleSelect(employee)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedEmployee?.identifier ===
                                    employee.identifier
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {employee.firstName} {employee.lastName} (
                              {employee.identifier})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </DialogFormWithScroll>
            </DialogScrollArea>
            <DialogFooter className='mt-4'>
              {isPendingUpdate ? (
                <Button disabled className='w-full'>
                  <Save className='animate-spin' />
                  Zapisz
                </Button>
              ) : (
                <Button type='submit' className='w-full'>
                  <Save />
                  Zapisz
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
