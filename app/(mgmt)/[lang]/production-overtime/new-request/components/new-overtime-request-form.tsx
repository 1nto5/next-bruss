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
import { DateTimeInput } from '@/components/ui/datetime-input';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { EmployeeType } from '@/lib/types/employee-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleX, Loader2, Pencil, Plus, Table } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { NewOvertimeRequestSchema } from '../../lib/production-overtime-zod';
import {
  insertOvertimeRequest as insert,
  insertDraftOvertimeRequest as insertDraft,
} from '../actions';
import { MultiSelect } from './multi-select-employees';

export default function NewOvertimeRequestForm({
  employees,
}: {
  employees: EmployeeType[];
}) {
  const [isPendingInsert, setIsPendingInserting] = useState(false);
  const [isPendingInsertDraft, setIsPendingInsertingDraft] = useState(false);

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
      employees: [],
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
        // form.reset(); // Reset form after successful submission
        // redirect();
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

  const handleDraftInsert = async (
    data: z.infer<typeof NewOvertimeRequestSchema>,
  ) => {
    setIsPendingInsertingDraft(true);
    try {
      const res = await insertDraft(data);
      if ('success' in res) {
        toast.success('Szkic zapisany!');
        // form.reset();
        // redirect();
      } else if ('error' in res) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('handleDraftInsert', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingInsertingDraft(false);
    }
  };

  return (
    <Card className='sm:w-[768px]'>
      <CardHeader>
        <div className='flex justify-between gap-2 sm:gap-4'>
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
          {/* <ScrollArea className='h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[30rem]'> */}
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
                          // className='w-48'
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
                      // min={new Date(Date.now() - 8 * 3600 * 1000)}
                      min={new Date(Date.now() + 8 * 3600 * 1000)}
                      timePicker={{ hour: true, minute: true, second: false }}
                      renderTrigger={({ value, setOpen, open }) => (
                        <DateTimeInput
                          value={value}
                          onChange={field.onChange}
                          format='dd/MM/yyyy HH:mm'
                          onCalendarClick={() => setOpen(!open)}
                          // className='w-48'
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
              name='employees'
              render={({ field }) => (
                <FormItem>
                  <div className='flex flex-col items-start space-y-2'>
                    <FormLabel>Pracownicy</FormLabel>
                    <FormControl>
                      <MultiSelect
                        employees={employees}
                        value={field.value}
                        onSelectChange={field.onChange}
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
                    <Textarea
                      // placeholder='Tell us a little bit about yourself'
                      className=''
                      {...field}
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
                  <FormLabel>Dodatkowe informacje</FormLabel>
                  <FormControl>
                    <Textarea
                      // placeholder='Tell us a little bit about yourself'
                      className=''
                      {...field}
                    />
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

            {/* <div className='flex space-x-2'>
              <FormField
                control={form.control}
                name='articleNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artykuł</FormLabel>
                    <FormControl>
                      <Input
                        className='w-20'
                        autoFocus
                        placeholder='12345'
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='articleName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa</FormLabel>
                    <div className='flex items-center space-x-2'>
                      <FormControl>
                        <Input
                          className='w-44'
                          placeholder='F-IWDR92,1L-ST'
                          {...field}
                        />
                      </FormControl>
                      {isPendingFindArticleName ? (
                        <Button
                          size='icon'
                          variant='outline'
                          type='button'
                          disabled
                        >
                          <Loader2 className='h-4 w-4 animate-spin' />
                        </Button>
                      ) : (
                        <Button
                          size='icon'
                          variant='outline'
                          type='button'
                          onClick={handleFindArticleName}
                        >
                          <AArrowDown />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div> */}

            {/* <FormField
              control={form.control}
              name='customerNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numer części klienta</FormLabel>
                  <FormControl>
                    <Input className='w-48' placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
          </CardContent>
          {/* </ScrollArea> */}

          <Separator className='mb-4' />

          {/* FIXME: dopasuj do niskich rozdzielczości wyświetlanie przycisków - problem z przewijaniem*/}
          <CardFooter className='flex justify-between'>
            <Button
              variant='destructive'
              type='button'
              onClick={() => form.reset()}
            >
              <CircleX />
              Wyczyść
            </Button>
            <div className='flex space-x-2'>
              {isPendingInsertDraft ? (
                <Button variant='secondary' disabled>
                  <Loader2 className='animate-spin' />
                  Zapisywanie
                </Button>
              ) : (
                <Button
                  variant='secondary'
                  type='button'
                  onClick={() => {
                    // setIsDraft(true);
                    // form.handleSubmit(handleDraftInsert)();
                    // handleDraftInsert(form.getValues());
                  }}
                >
                  <Pencil />
                  Zapisz szkic
                </Button>
              )}
              {isPendingInsert ? (
                <Button disabled>
                  <Loader2 className='animate-spin' />
                  Dodawanie
                </Button>
              ) : (
                <Button type='submit'>
                  <Plus />
                  Dodaj zlecenie
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
