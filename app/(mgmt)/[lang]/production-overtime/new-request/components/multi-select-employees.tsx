'use client';

import DialogFormWithScroll from '@/components/dialog-form-with-scroll';
import DialogScrollArea from '@/components/dialog-scroll-area';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  Dialog,
  DialogContent,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { EmployeeType } from '@/lib/types/employee-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, CircleX, CopyPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { selectedEmployeeForOvertimeType } from '../../lib/production-overtime-types';

interface MultiSelectEmployeesProps {
  employees: selectedEmployeeForOvertimeType[];
  value: selectedEmployeeForOvertimeType[];
  onSelectChange: (value: selectedEmployeeForOvertimeType[]) => void;
  placeholder?: string;
}

export const MultiSelectEmployees = ({
  employees,
  value,
  onSelectChange,
  placeholder = 'Wybierz pracowników...',
}: MultiSelectEmployeesProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [pendingEmployee, setPendingEmployee] = useState<EmployeeType | null>(
    null,
  );
  const [dateError, setDateError] = useState(false);

  const DayOffSchema = z
    .object({
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

  const form = useForm<z.infer<typeof DayOffSchema>>({
    resolver: zodResolver(DayOffSchema),
    defaultValues: {
      date: undefined,
      note: '',
      isDayOffAgreed: true,
    },
  });

  const isDayOffAgreed = form.watch('isDayOffAgreed');

  const handleSelect = (employee: EmployeeType) => {
    const isSelected = value.some(
      (item) => item.identifier === employee.identifier,
    );
    if (isSelected) {
      onSelectChange(
        value.filter((item) => item.identifier !== employee.identifier),
      );
    } else {
      setPendingEmployee(employee);
      form.reset({
        isDayOffAgreed: true,
        date: undefined,
        note: '',
      });
      setOpenDialog(true);
    }
    setInputValue('');
  };

  const handleAddEmployee = () => {
    // Walidacja danych formularza
    form.handleSubmit((formData) => {
      if (formData.isDayOffAgreed && !formData.date) {
        setDateError(true);
        return;
      }

      if (pendingEmployee) {
        let normalizedDate;
        if (formData.isDayOffAgreed && formData.date) {
          normalizedDate = new Date(formData.date);
          normalizedDate.setHours(12, 0, 0, 0);
        }

        const newEmployee = {
          ...pendingEmployee,
          note: formData.note || '',
          ...(formData.isDayOffAgreed && formData.date
            ? { agreedReceivingAt: normalizedDate }
            : {}),
        };
        onSelectChange([...value, newEmployee]);
      }
      setOpenDialog(false);
      setPendingEmployee(null);
      form.reset();
      setDateError(false);
    })();
  };

  const agreedTimeDialog = (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>
            Uzgodniony termin odbioru dnia wolnego dla:{' '}
            {pendingEmployee?.firstName} {pendingEmployee?.lastName}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <DialogScrollArea className='h-[50vh] sm:h-[50vh]'>
            <DialogFormWithScroll>
              <FormField
                control={form.control}
                name='isDayOffAgreed'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between space-y-0 py-2'>
                    <FormLabel className='leading-normal'>
                      Uzgodniono odbiór dnia wolnego
                    </FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue('date', undefined);
                            setDateError(false);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Rozpoczęcie</FormLabel> */}
                    <FormControl>
                      <DateTimePicker
                        modal
                        hideTime
                        value={field.value}
                        onChange={field.onChange}
                        timePicker={{ hour: true, minute: true }}
                        disabled={!isDayOffAgreed}
                        renderTrigger={({ open, value, setOpen }) => (
                          <DateTimeInput
                            value={value}
                            onChange={(x) => !open && field.onChange(x)}
                            format='dd/MM/yyyy'
                            disabled={open || !isDayOffAgreed}
                            onCalendarClick={() =>
                              isDayOffAgreed && setOpen(!open)
                            }
                          />
                        )}
                      />
                    </FormControl>
                    {dateError && isDayOffAgreed && (
                      <p className='text-destructive text-sm'>
                        Wybierz datę odbioru!
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='note'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uwagi</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogFormWithScroll>
          </DialogScrollArea>
          <DialogFooter className='mt-4'>
            <Button
              type='button'
              className='w-full'
              onClick={handleAddEmployee}
            >
              <CopyPlus /> Dodaj zlecenie pracownika
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className='w-full justify-between'
          >
            <span className={cn(!value.length && 'opacity-50')}>
              {value.length > 0
                ? `wybrano ${value.length} ${value.length === 1 ? 'pracownika' : 'pracowników'}`
                : placeholder}
            </span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0' side='bottom' align='start'>
          <Command>
            <CommandInput
              placeholder='Szukaj pracowników...'
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>Nie znaleziono pracowników.</CommandEmpty>
              <CommandGroup>
                {value.length > 0 && (
                  <CommandItem key='reset' onSelect={() => onSelectChange([])}>
                    <CircleX className='mr-2 h-4 w-4 text-red-500' />
                    usuń wszystkich
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
                        value.some(
                          (item) => item.identifier === employee.identifier,
                        )
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

      {value.length > 0 && (
        <Table>
          <TableCaption>Wybrani pracownicy</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Pracownik</TableHead>
              <TableHead>Nr personalny</TableHead>
              <TableHead>Data odbioru</TableHead>
              <TableHead>Uwagi</TableHead>
              <TableHead>Usuń</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {value.map((employee) => (
              <TableRow key={employee.identifier}>
                <TableCell className='font-medium'>
                  {employee.firstName} {employee.lastName}
                </TableCell>
                <TableCell>{employee.identifier}</TableCell>
                <TableCell>
                  {employee.agreedReceivingAt
                    ? employee.agreedReceivingAt.toLocaleDateString('pl')
                    : '-'}
                </TableCell>
                <TableCell>{employee.note || '-'}</TableCell>
                <TableCell>
                  <CircleX
                    className='h-4 w-4 cursor-pointer text-red-500'
                    onClick={() =>
                      onSelectChange(
                        value.filter(
                          (item) => item.identifier !== employee.identifier,
                        ),
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {agreedTimeDialog}
    </>
  );
};
