'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EmployeeType } from '@/lib/types/employee-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleX, Plus, Table } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  addEmployeeDayOff,
  redirectToProductionOvertimeDaysOff as redirect,
} from '../actions';
import { overtimeRequestEmployeeType } from '../lib/production-overtime-types';
import { MultiSelectEmployees } from './multi-select-employees';

const AddEmployeeSchema = z.object({
  employeesToAdd: z.array(
    z.object({
      identifier: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      agreedReceivingAt: z.date().optional(),
      note: z.string().optional(),
    }),
  ),
});

export default function AddDayOff({
  employees,
  id,
}: {
  employees: EmployeeType[];
  id: string;
}) {
  const [isPendingInsert, setIsPendingInserting] = useState(false);

  const form = useForm<z.infer<typeof AddEmployeeSchema>>({
    resolver: zodResolver(AddEmployeeSchema),
    defaultValues: {
      employeesToAdd: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof AddEmployeeSchema>) => {
    if (data.employeesToAdd.length === 0) {
      toast.error('Wybierz co najmniej jednego pracownika!');
      return;
    }

    setIsPendingInserting(true);
    try {
      // Dodajemy każdego pracownika osobno
      for (const employee of data.employeesToAdd) {
        const res = await addEmployeeDayOff(
          id,
          employee as overtimeRequestEmployeeType,
        );
        if ('error' in res) {
          if (res.error === 'too many employees with scheduled days off') {
            toast.error(
              'Przekroczono maksymalną liczbę pracowników dla tego zlecenia!',
            );
          } else if (res.error === 'unauthorized') {
            toast.error('Brak uprawnień do modyfikacji tego zlecenia!');
          } else if (res.error === 'employee already exists') {
            toast.error(
              `Pracownik ${employee.firstName} ${employee.lastName} został już wcześniej dodany!`,
            );
          } else {
            console.error(res.error);
            toast.error('Wystąpił błąd podczas dodawania pracownika!');
          }
          return;
        }
      }
      toast.success('Pracownicy zostali dodani!');
      redirect(id);
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingInserting(false);
    }
  };

  return (
    <Card className='sm:w-[768px]'>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>Dodaj odbiór dnia wolnego</CardTitle>
          <Link href={`/production-overtime/${id}`}>
            <Button variant='outline'>
              <Table /> <span>Powrót do zlecenia</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Separator className='mb-4' />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className='grid w-full items-center gap-4'>
          <MultiSelectEmployees
            employees={employees}
            value={form.watch('employeesToAdd')}
            onSelectChange={(selectedEmployees) => {
              form.setValue('employeesToAdd', selectedEmployees);
            }}
            placeholder='Wyszukaj pracownika...'
          />
        </CardContent>
        <Separator className='mb-4' />

        <CardFooter className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
          <Button
            variant='destructive'
            type='button'
            onClick={() => form.reset()}
            className='w-full sm:w-auto'
          >
            <CircleX className='' />
            Wyczyść
          </Button>
          <div className='flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:space-x-2'>
            <Button
              type='submit'
              className='w-full sm:w-auto'
              disabled={
                isPendingInsert || form.watch('employeesToAdd').length === 0
              }
            >
              <Plus className={isPendingInsert ? 'animate-spin' : ''} />
              Dodaj{' '}
              {form.watch('employeesToAdd').length === 1
                ? 'pracownika'
                : 'pracowników'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
