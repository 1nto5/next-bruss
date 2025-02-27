'use client';

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
import { FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch'; // Add Switch import
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
import { EmployeeType } from '@/lib/types/employee-types';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, CircleX, CopyPlus } from 'lucide-react';
import * as React from 'react';
import { selectedEmployeeForOvertimeType } from '../../lib/production-overtime-types';

interface MultiSelectProps {
  employees: selectedEmployeeForOvertimeType[];
  value: selectedEmployeeForOvertimeType[];
  onSelectChange: (value: selectedEmployeeForOvertimeType[]) => void;
  placeholder?: string;
}

export const MultiSelect = ({
  employees,
  value,
  onSelectChange,
  placeholder = 'Wybierz pracowników...',
}: MultiSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const [openDialog, setOpenDialog] = React.useState(false);

  // new states for pending employee and selected date
  const [pendingEmployee, setPendingEmployee] =
    React.useState<EmployeeType | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  // new state for note
  const [note, setNote] = React.useState('');

  // New state for tracking if day off is agreed
  const [isDayOffAgreed, setIsDayOffAgreed] = React.useState(true);

  // Add state to track validation errors
  const [dateError, setDateError] = React.useState(false);

  // Reset form when opening dialog for a new employee
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
      // Reset form values when opening dialog
      setSelectedDate(null);
      setNote('');
      setIsDayOffAgreed(true);
      setDateError(false);
      setOpenDialog(true);
    }
    setInputValue('');
  };

  // Modified handleConfirm to validate date when switch is on
  const handleConfirm = () => {
    // Validate: if day off is agreed, date must be selected
    if (isDayOffAgreed && !selectedDate) {
      setDateError(true);
      return; // Don't proceed if validation fails
    }

    if (pendingEmployee) {
      // Set the time to noon to avoid timezone issues
      const normalizedDate = selectedDate ? new Date(selectedDate) : null;
      if (normalizedDate) {
        normalizedDate.setHours(12, 0, 0, 0); // Set time to 12:00:00.000
      }

      const newEmployee = {
        ...pendingEmployee,
        note: note,
        // Only include the date if day off is agreed
        ...(isDayOffAgreed && normalizedDate
          ? { agreedReceivingAt: normalizedDate }
          : {}),
      };
      onSelectChange([...value, newEmployee]);
    }
    setOpenDialog(false);
    setPendingEmployee(null);
    setSelectedDate(null); // Reset to null instead of new Date()
    setNote('');
    setIsDayOffAgreed(true);
    setDateError(false);
  };

  // Reset date error when date is selected or switch is turned off
  React.useEffect(() => {
    if (selectedDate || !isDayOffAgreed) {
      setDateError(false);
    }
  }, [selectedDate, isDayOffAgreed]);

  const handleRemove = (identifier: string) => {
    onSelectChange(value.filter((item) => item.identifier !== identifier));
  };

  const handleClear = () => {
    onSelectChange([]);
  };

  // Normalize the date when it's selected from the DateTimePicker
  const handleDateChange = (date: Date | null) => {
    if (isDayOffAgreed && date) {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(12, 0, 0, 0); // Set time to 12:00:00.000
      setSelectedDate(normalizedDate);
    } else {
      setSelectedDate(date);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className='w-[350px] justify-between'
          >
            <span className={cn(!value.length && 'opacity-50')}>
              {value.length > 0
                ? `wybrano ${value.length} ${
                    value.length === 1 ? 'pracownika' : 'pracowników'
                  }`
                : 'wybierz pracowników'}
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
                  <CommandItem
                    key='reset'
                    onSelect={() => {
                      handleClear();
                    }}
                  >
                    <CircleX className='mr-2 h-4 w-4 text-red-500' />
                    usuń wszystkich
                  </CommandItem>
                )}
                {employees.map((employee) => (
                  <CommandItem
                    key={employee.identifier}
                    value={
                      employee.identifier +
                      employee.firstName +
                      employee.lastName
                    }
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
        // <ScrollArea className='h-[300px] w-full'>
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
                <TableCell>{employee.note ? employee.note : '-'}</TableCell>
                <TableCell>
                  <CircleX
                    className='mr-2 h-4 w-4 cursor-pointer text-red-500'
                    onClick={() => handleRemove(employee.identifier)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        // </ScrollArea>
      )}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='w-[700px] sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>
              Uzgodniony termin odbioru dnia wolnego dla:{' '}
              {pendingEmployee?.firstName} {pendingEmployee?.lastName}
            </DialogTitle>
            {/* <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription> */}
          </DialogHeader>
          {/* <ScrollArea className='h-[70vh]'> */}
          <div className='grid items-center gap-2 p-2'>
            <div className='flex items-center justify-between space-y-2'>
              <Label htmlFor='day-off-agreed' className='leading-normal'>
                Uzgodniono odbiór dnia wolnego
              </Label>
              <Switch
                id='day-off-agreed'
                checked={isDayOffAgreed}
                onCheckedChange={setIsDayOffAgreed}
              />
            </div>

            {/* Date picker with error state */}
            <div className={cn(!isDayOffAgreed && 'opacity-50')}>
              <DateTimePicker
                min={new Date(Date.now())}
                modal
                value={selectedDate ?? undefined}
                onChange={(date) => handleDateChange(date ?? null)}
                hideTime
                disabled={!isDayOffAgreed}
                renderTrigger={({ open, value, setOpen }) => (
                  <DateTimeInput
                    value={value}
                    onChange={(x) =>
                      !open && isDayOffAgreed && handleDateChange(x || null)
                    }
                    format='dd/MM/yyyy'
                    disabled={open || !isDayOffAgreed}
                    onCalendarClick={() => isDayOffAgreed && setOpen(!open)}
                    className={cn(dateError && 'border-red-500')}
                  />
                )}
              />
              {dateError && isDayOffAgreed && (
                <FormMessage>Data odbioru jest wymagana</FormMessage>
              )}
            </div>

            <Label htmlFor='note'>Uwagi</Label>
            <Textarea
              id='note'
              value={note} // controlled textarea value
              onChange={(e) => setNote(e.target.value)} // update note state
            />
          </div>
          {/* </ScrollArea> */}
          <DialogFooter className='mt-4'>
            <Button className='w-full' type='button' onClick={handleConfirm}>
              <CopyPlus /> Dodaj zlecenie pracownika
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
