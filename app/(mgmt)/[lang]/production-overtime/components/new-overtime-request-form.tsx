'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';
import { EmployeeType } from '@/lib/types/employee-types';
import { UsersListType } from '@/lib/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown, CircleX, Plus, Table } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  insertOvertimeRequest as insert,
  redirectToProductionOvertime as redirect,
} from '../actions';
import { MultiSelectEmployees } from '../components/multi-select-employees';
import { NewOvertimeRequestSchema } from '../lib/zod';

export default function NewOvertimeRequestForm({
  employees,
  users,
  loggedInUserEmail,
}: {
  employees: EmployeeType[];
  users: UsersListType;
  loggedInUserEmail: string;
}) {
  const [isPendingInsert, setIsPendingInserting] = useState(false);
  const [responsibleEmployeeOpen, setResponsibleEmployeeOpen] = useState(false);

  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const nextSaturdayFrom = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysUntilSaturday,
    6,
    0,
    0,
  );
  const nextSaturdayTo = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + daysUntilSaturday,
    14,
    0,
    0,
  );

  const form = useForm<z.infer<typeof NewOvertimeRequestSchema>>({
    resolver: zodResolver(NewOvertimeRequestSchema),
    defaultValues: {
      numberOfEmployees: 1,
      responsibleEmployee: loggedInUserEmail || '',
      employeesWithScheduledDayOff: [],
      from: nextSaturdayFrom,
      to: nextSaturdayTo,
      reason: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof NewOvertimeRequestSchema>) => {
    setIsPendingInserting(true);
    try {
      const res = await insert(data);
      if ('success' in res) {
        toast.success('Zlecenie dodane!');
        form.reset(); // Reset form after successful submission
        redirect();
      } else if ('error' in res) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
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
          <CardTitle>
            Nowe zlecenie wykonania pracy w godzinach nadliczbowych - produkcja
          </CardTitle>
          <Link href='/production-overtime'>
            <Button variant='outline'>
              <Table /> <span>Tabela zleceń</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Separator className='mb-4' />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='from'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rozpoczęcie pracy</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      min={new Date(Date.now() + 8 * 3600 * 1000)}
                      timePicker={{ hour: true, minute: true, second: false }}
                      renderTrigger={({ value, setOpen, open }) => (
                        <DateTimeInput
                          value={value}
                          onChange={field.onChange}
                          format='dd/MM/yyyy HH:mm'
                          onCalendarClick={() => setOpen(!open)}
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
              name='to'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zakończenie pracy</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      min={new Date(Date.now() + 8 * 3600 * 1000)}
                      timePicker={{ hour: true, minute: true, second: false }}
                      renderTrigger={({ value, setOpen, open }) => (
                        <DateTimeInput
                          value={value}
                          onChange={field.onChange}
                          format='dd/MM/yyyy HH:mm'
                          onCalendarClick={() => setOpen(!open)}
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
              name='responsibleEmployee'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odpowiedzialny</FormLabel>
                  <FormDescription>
                    Wybierz pracownika nadzorującego pracę w godzinach
                    nadliczbowych – będzie zobowiązany do przesłania listy
                    obecności.
                  </FormDescription>
                  <Popover
                    open={responsibleEmployeeOpen}
                    onOpenChange={setResponsibleEmployeeOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? users.find((user) => user.email === field.value)
                                ?.name
                            : 'Wybierz odpowiedzialną osobę'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='p-0' side='bottom' align='start'>
                      <Command>
                        <CommandInput placeholder='Szukaj osoby...' />
                        <CommandList>
                          <CommandEmpty>Nie znaleziono osoby.</CommandEmpty>
                          <CommandGroup className='max-h-48 overflow-y-auto'>
                            {users.map((user) => (
                              <CommandItem
                                value={user.name}
                                key={user.email}
                                onSelect={() => {
                                  form.setValue(
                                    'responsibleEmployee',
                                    user.email,
                                  );
                                  setResponsibleEmployeeOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    user.email === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                {user.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='numberOfEmployees'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liczba pracowników</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      {...field}
                      onChange={(e) => {
                        const value =
                          e.target.value === '' ? 1 : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='employeesWithScheduledDayOff'
              render={({ field }) => (
                <FormItem>
                  <div className='flex flex-col items-start space-y-2'>
                    <FormLabel>Pracownicy odbierający dni wolne</FormLabel>
                    <FormControl>
                      <MultiSelectEmployees
                        employees={employees}
                        value={field.value}
                        onSelectChange={(selectedEmployees) => {
                          const employeesWithDays = selectedEmployees.map(
                            (emp) => ({
                              ...emp,
                              agreedReceivingAt: new Date(
                                Date.now() + 7 * 24 * 60 * 60 * 1000,
                              ),
                            }),
                          );
                          field.onChange(employeesWithDays);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Uzasadnienie pracy w godzinach nadliczbowych
                  </FormLabel>
                  <FormControl>
                    <Textarea className='' {...field} />
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
                  <FormLabel>Dodatkowe informacje</FormLabel>
                  <FormControl>
                    <Textarea className='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion type='single' collapsible>
              <AccordionItem value='item-1'>
                <AccordionTrigger>
                  Zachowanie nieprzerwanego odpoczynku
                </AccordionTrigger>
                <AccordionContent className='text-justify'>
                  Pracownik zachował co najmniej 11 godzin nieprzerwanego
                  odpoczynku w każdej dobie oraz co najmniej 35 godzin
                  nieprzerwanego odpoczynku tygodniowego (w przypadku
                  pracowników przechodzących na inną zmianę czas odpoczynku nie
                  może być krótszy niż 24 godziny).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='item-2'>
                <AccordionTrigger>Standard Bruss</AccordionTrigger>
                <AccordionContent className='text-justify'>
                  Za pracę w niedzielę i święta pracownik, dla którego jest to
                  7. dzień pracy z kolei, otrzymuje dzień wolny (zgodnie z
                  przepisami KP – patrz: Informacje / podstawy prawne) oraz
                  dodatek do wynagrodzenia w wysokości 100% wynagrodzenia za
                  każdą godzinę pracy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='item-3'>
                <AccordionTrigger>
                  Informacje / podstawy prawne
                </AccordionTrigger>
                <AccordionContent className='text-justify'>
                  <p>
                    1. Zmiany 6.00-14.00; 7.00-15.00; 8.00-16.00; 14.00-22.00;
                    22.00 - 6.00 - norma dobowa czasu pracy 8 godzin
                  </p>
                  <p>
                    2. Czas pracy wraz z pracą nadliczbową nie może przekroczyć
                    13h na dobę - powyżej 13h praca w nadgodzinach jest
                    niedopuszczalna
                  </p>
                  <p>
                    3. Tygodniowy czas pracy łącznie z godzinami nadliczbowymi
                    nie może przekraczać przeciętnie 48 godzin w przyjętym
                    okresie rozliczeniowym
                  </p>
                  <p>
                    4. Zgodnie z przepisami art. 15111 kodeksu pracy pracownik
                    wykonujący pracę w niedziele i święta powinien skorzystać z
                    dnia wolnego od pracy w okresie sześciu dni kalendarzowych
                    poprzedzających lub następujących po takiej niedzieli, za
                    pracę w święto – do końca okresu rozliczeniowego, a jeżeli
                    jest to niemożliwe pracownik ma prawo do innego dnia wolnego
                    od pracy do końca okresu rozliczeniowego. Jeżeli udzielenie
                    takiego dnia także i w tym okresie nie jest możliwe,
                    pracownikowi przysługuje dodatek do wynagrodzenia w
                    wysokości 100% wynagrodzenia za każdą godzinę pracy w
                    niedzielę/święto.
                  </p>
                  <p>
                    W zakładzie funkcjonuje system podstawowy (art. 129 kp –
                    norma dobowa 8h i tygodniowa przeciętna 40h w pięciodniowym
                    tydzień czasu pracy). Podstawa prawna: art. 131, art. 132,
                    art. 133, art. 151&3 i 4, art. 151(1), art. 151(11) Kodeksu
                    pracy.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>

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
            <Button
              type='submit'
              className='w-full sm:w-auto'
              disabled={isPendingInsert}
            >
              <Plus className={isPendingInsert ? 'animate-spin' : ''} />
              Dodaj zlecenie
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
