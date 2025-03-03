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
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [note, setNote] = useState('');
  const [isDayOffAgreed, setIsDayOffAgreed] = useState(true);
  const [dateError, setDateError] = useState(false);

  // Update the validation schema to conditionally require date
  const DayOffSchema = z.object({
    isDayOffAgreed: z.boolean(),
    date: z
      .date({ message: 'Wybierz datę odbioru!' })
      .optional()
      .refine((date) => !isDayOffAgreed || date !== undefined, {
        message: 'Wybierz datę odbioru!',
      }),
    note: z.string().optional(),
  });

  const form = useForm<z.infer<typeof DayOffSchema>>({
    resolver: zodResolver(DayOffSchema),
    defaultValues: {
      date: undefined,
      note: '',
      isDayOffAgreed: true,
    },
  });

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
      form.reset();
      setOpenDialog(true);
    }
    setInputValue('');
  };

  const onSubmit = () => {
    if (isDayOffAgreed && !date) {
      setDateError(true);
      return;
    }

    if (pendingEmployee) {
      let normalizedDate;
      if (isDayOffAgreed && date) {
        normalizedDate = new Date(date);
        normalizedDate.setHours(12, 0, 0, 0);
      }

      const newEmployee = {
        ...pendingEmployee,
        note,
        ...(isDayOffAgreed && date
          ? { agreedReceivingAt: normalizedDate }
          : {}),
      };
      onSelectChange([...value, newEmployee]);
    }
    setOpenDialog(false);
    setPendingEmployee(null);
    form.reset();
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                          checked={isDayOffAgreed}
                          onCheckedChange={(checked) => {
                            setIsDayOffAgreed(checked);
                            field.onChange(checked);
                            // Reset date when toggling off
                            if (!checked) {
                              form.setValue('date', undefined);
                              setDate(undefined);
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
                      <FormLabel>Rozpoczęcie</FormLabel>
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
              <Button className='w-full'>
                <CopyPlus /> Dodaj zlecenie pracownika
              </Button>
            </DialogFooter>
          </form>
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
