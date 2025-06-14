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
import { overtimeRequestEmployeeType } from '../lib/types';

interface MultiSelectEmployeesProps {
  employees: overtimeRequestEmployeeType[];
  value: overtimeRequestEmployeeType[];
  onSelectChange: (value: overtimeRequestEmployeeType[]) => void;
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

  const dayOffSchema = z.object({
    date: z.date({ message: 'Wybierz datę odbioru!' }),
    note: z.string().optional().default(''),
  });

  const form = useForm<z.infer<typeof dayOffSchema>>({
    resolver: zodResolver(dayOffSchema),
    defaultValues: {
      date: undefined,
      note: '',
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
      form.reset({
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
      if (!formData.date) {
        setDateError(true);
        return;
      }

      if (pendingEmployee) {
        let normalizedDate;
        if (formData.date) {
          normalizedDate = new Date(formData.date);
          normalizedDate.setHours(12, 0, 0, 0);
        }

        const newEmployee = {
          ...pendingEmployee,
          note: formData.note || '',
          ...(formData.date ? { agreedReceivingAt: normalizedDate } : {}),
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
                        renderTrigger={({ open, value, setOpen }) => (
                          <DateTimeInput
                            value={value}
                            onChange={(x) => !open && field.onChange(x)}
                            format='dd/MM/yyyy'
                            disabled={open}
                            onCalendarClick={() => setOpen(!open)}
                          />
                        )}
                      />
                    </FormControl>
                    {dateError && (
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
              <CopyPlus /> Dodaj odbiór dnia wolnego
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
