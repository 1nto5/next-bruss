'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { EmployeeType } from '@/lib/types/employee-types';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, CircleX, X } from 'lucide-react';
import * as React from 'react';

interface MultiSelectProps {
  employees: EmployeeType[];
  value: EmployeeType[];
  onSelectChange: (value: EmployeeType[]) => void;
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

  const handleSelect = (employee: EmployeeType) => {
    const isSelected = value.some(
      (item) => item.identifier === employee.identifier,
    );
    if (isSelected) {
      onSelectChange(
        value.filter((item) => item.identifier !== employee.identifier),
      );
    } else {
      onSelectChange([...value, employee]);
    }
    setInputValue('');
  };

  const handleRemove = (identifier: string) => {
    onSelectChange(value.filter((item) => item.identifier !== identifier));
  };

  const handleClear = () => {
    onSelectChange([]);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className={cn(
              'w-[350px] justify-between',
              !value.length && 'opacity-50',
            )}
          >
            {value.length > 0
              ? `wybrano ${value.length} ${value.length === 1 ? 'pracownika' : 'pracowników'}`
              : 'wybierz pracowników'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[350px] p-0' side='bottom' align='start'>
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
      <div className='mt-2 flex flex-wrap gap-2'>
        {value.map((employee) => (
          <Badge
            key={employee.identifier}
            variant='secondary'
            className='flex items-center gap-1'
          >
            {employee.firstName} {employee.lastName} ({employee.identifier})
            <X
              className='h-3 w-3 cursor-pointer'
              onClick={() => handleRemove(employee.identifier)}
            />
          </Badge>
        ))}
      </div>
    </>
  );
};
