'use client';
import {
  DeviationAreaType,
  DeviationReasonType,
} from '@/app/(mgmt)/[lang]/deviations/lib/types';
import {
  addDeviationDraftSchema,
  addDeviationSchema,
} from '@/app/(mgmt)/[lang]/deviations/lib/zod';
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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Locale } from '@/i18n.config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eraser, Pencil, Plus, Search, Table } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  findArticleName,
  insertDeviation,
  insertDraftDeviation,
  redirectToDeviations,
} from '../actions';

export default function AddDeviationForm({
  reasonOptions,
  areaOptions,
  lang,
}: {
  reasonOptions: DeviationReasonType[];
  areaOptions: DeviationAreaType[];
  lang: Locale;
}) {
  // const [isDraft, setIsDraft] = useState<boolean>();
  const [isPendingInsert, setIsPendingInserting] = useState(false);
  const [isPendingInsertDraft, setIsPendingInsertingDraft] = useState(false);
  const [isPendingFindArticleName, startFindArticleNameTransition] =
    useTransition();

  const form = useForm<z.infer<typeof addDeviationSchema>>({
    resolver: zodResolver(addDeviationSchema),
    defaultValues: {
      // articleNumber: '',
      // articleName: '',
      // workplace: '',
      // drawingNumber: '',
      // quantity: '',
      // charge: '',
      // description: '',
      // reason: '',
      periodFrom: undefined,
      periodTo: undefined,
      // area: '',
      // processSpecification: '',
      // customerNumber: '',
      customerAuthorization: false,
    },
  });

  const handleFindArticleName = async () => {
    startFindArticleNameTransition(async () => {
      try {
        const articleNumber = form.getValues('articleNumber');
        if (!articleNumber) {
          toast.error('Wprowadź numer artykułu');
          return;
        }
        if (articleNumber.length === 5) {
          const res = await findArticleName(articleNumber);
          if (res.success) {
            form.setValue('articleName', res.success);
          } else if (res.error === 'not found') {
            toast.error('Nie znaleziono artykułu');
          } else if (res.error) {
            console.error(res.error);
            toast.error('Skontaktuj się z IT!');
          }
        } else {
          toast.error('Wprowadź poprawny numer artykułu');
        }
      } catch (error) {
        console.error('handleFindArticleName', error);
        toast.error('Skontaktuj się z IT!');
      }
    });
  };

  const onSubmit = async (data: z.infer<typeof addDeviationSchema>) => {
    // setIsDraft(false);
    setIsPendingInserting(true);
    try {
      const res = await insertDeviation(data);
      if (res.success) {
        toast.success('Odchylenie dodane!');
        // form.reset()
        redirectToDeviations();
      } else if (res.error) {
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
    data: z.infer<typeof addDeviationDraftSchema>,
  ) => {
    setIsPendingInsertingDraft(true);
    try {
      const res = await insertDraftDeviation(data);
      if (res.success) {
        toast.success('Szkic zapisany!');
        // form.reset();
        redirectToDeviations();
      } else if (res.error) {
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
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>Nowe odchylenie</CardTitle>
          <Link href='/deviations'>
            <Button variant='outline'>
              <Table /> <span>Tabela odchyleń</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Separator className='mb-4' />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            {/* <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2'> */}
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Artykuł</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='articleName'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Nazwa</FormLabel>
                  <div className='flex items-center space-x-2'>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <Button
                      variant='outline'
                      type='button'
                      onClick={handleFindArticleName}
                      disabled={isPendingFindArticleName}
                    >
                      <Search
                        className={
                          isPendingFindArticleName ? 'animate-spin' : ''
                        }
                      />{' '}
                      <span>Znajdź nazwę</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* </div> */}

            <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2'>
              <FormField
                control={form.control}
                name='customerNumber'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Numer części klienta</FormLabel>
                    <FormControl>
                      <Input placeholder='' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='customerName'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Nazwa części klienta</FormLabel>
                    <FormControl>
                      <Input placeholder='' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='workplace'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Stanowisko</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='area'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Obszar</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      {areaOptions.map((area) => (
                        <FormItem
                          key={area.value}
                          className='flex items-center space-y-0 space-x-3'
                        >
                          <FormControl>
                            <RadioGroupItem value={area.value} />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            {lang === 'pl' ? area.pl : area.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='drawingNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numer rysunku</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4'>
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Ilość</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='unit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jednostka</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        // defaultValue={field.value}
                        className='flex flex-row sm:flex-col'
                      >
                        <FormItem
                          key={'pc'}
                          className='flex items-center space-y-0 space-x-3'
                        >
                          <FormControl>
                            <RadioGroupItem value='pcs' />
                          </FormControl>
                          <FormLabel className='font-normal'>szt.</FormLabel>
                        </FormItem>
                        <FormItem
                          key={'kg'}
                          className='ml-4 flex items-center space-y-0 space-x-3 sm:ml-0'
                        >
                          <FormControl>
                            <RadioGroupItem value='kg' />
                          </FormControl>
                          <FormLabel className='font-normal'>kg</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='charge'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partia</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis odchylenia</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Wprowadź dowolny tekst opisujący odchylenie`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Wybierz powód:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      {reasonOptions.map((reason) => (
                        <FormItem
                          key={reason.value.toString()}
                          className='flex items-center space-y-0 space-x-3'
                        >
                          <FormControl>
                            <RadioGroupItem value={reason.value} />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            {lang === 'pl' ? reason.pl : reason.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2'>
              <FormField
                control={form.control}
                name='periodFrom'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Rozpoczęcie</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        modal
                        hideTime
                        value={field.value}
                        onChange={field.onChange}
                        min={(() => {
                          const today = new Date();
                          const minDate = new Date(today);
                          minDate.setDate(today.getDate() - 7);
                          return minDate;
                        })()}
                        max={(() => {
                          const today = new Date();
                          const maxDate = new Date(today);
                          maxDate.setDate(today.getDate() + 7);
                          return maxDate;
                        })()}
                        timePicker={{ hour: false, minute: false }}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='periodTo'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Zakończenie</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        modal
                        hideTime
                        value={field.value}
                        onChange={field.onChange}
                        min={form.getValues('periodFrom') || undefined}
                        max={(() => {
                          const today = new Date();
                          const maxDate = new Date(today);
                          maxDate.setDate(today.getDate() + 30);
                          return maxDate;
                        })()}
                        timePicker={{ hour: false, minute: false }}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='processSpecification'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specyfikacja procesu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Wprowadź specyfikację procesu gdy dotyczy`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='customerAuthorization'
              render={({ field }) => (
                <FormItem>
                  <div className='space-y-0.5'>
                    <FormLabel>Autoryzacja klienta</FormLabel>
                    {/* <FormDescription>
                    Receive emails about your account security.
                  </FormDescription> */}
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      // disabled
                      // aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
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
              <Eraser className='' />
              Wyczyść
            </Button>
            <div className='flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:space-x-2'>
              <Button
                variant='secondary'
                type='button'
                onClick={() => handleDraftInsert(form.getValues())}
                disabled={isPendingInsertDraft}
                className='w-full sm:w-auto'
              >
                <Pencil
                  className={isPendingInsertDraft ? 'animate-spin' : ''}
                />
                Zapisz szkic
              </Button>

              <Button
                disabled={isPendingInsert}
                type='submit'
                className='w-full sm:w-auto'
              >
                <Plus className={isPendingInsert ? 'animate-spin' : ''} />
                Dodaj odchylenie
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
