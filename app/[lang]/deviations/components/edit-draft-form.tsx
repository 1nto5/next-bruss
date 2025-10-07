'use client';

import {
  DeviationAreaType,
  DeviationReasonType,
  DeviationType,
} from '@/app/[lang]/deviations/lib/types';
import {
  addDeviationDraftSchema,
  addDeviationSchema,
} from '@/app/[lang]/deviations/lib/zod';
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
import { Locale } from '@/lib/config/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eraser, Pencil, Plus, Search, Table, Trash } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  deleteDraftDeviation,
  findArticleName,
  insertDeviation, // Import insertDeviation
  redirectToDeviations,
  updateDraftDeviation,
} from '../actions';

export default function EditDraftForm({
  reasonOptions,
  areaOptions,
  deviation,
  id,
  lang,
}: {
  reasonOptions: DeviationReasonType[];
  areaOptions: DeviationAreaType[];
  deviation: DeviationType;
  id: string;
  lang: Locale;
}) {
  const [isPendingInsert, setIsPendingInserting] = useState(false);
  const [isPendingUpdateDraft, setIsPendingUpdatingDraft] = useState(false);
  const [isPendingDeleteDraft, setIsPendingDeleteDraft] = useState(false);
  const [isPendingFindArticleName, startFindArticleNameTransition] =
    useTransition();

  const form = useForm<z.infer<typeof addDeviationSchema>>({
    resolver: zodResolver(addDeviationSchema),
    defaultValues: {
      articleNumber: deviation?.articleNumber || undefined,
      articleName: deviation?.articleName || undefined,
      workplace: deviation?.workplace || undefined,
      area: deviation?.area || undefined,
      quantity: deviation?.quantity?.value?.toString() || undefined,
      unit: deviation?.quantity?.unit || undefined,
      charge: deviation?.charge || undefined,
      description: deviation?.description || undefined,
      reason: deviation?.reason || undefined,
      periodFrom: deviation?.timePeriod?.from
        ? new Date(deviation.timePeriod.from)
        : undefined, // Changed default to undefined
      periodTo: deviation?.timePeriod?.to
        ? new Date(deviation.timePeriod.to)
        : undefined, // Changed default to undefined
      processSpecification: deviation?.processSpecification || undefined,
      customerNumber: deviation?.customerNumber || undefined,
      customerName: deviation?.customerName || undefined,
      customerAuthorization: deviation?.customerAuthorization || false,
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
    setIsPendingInserting(true);
    try {
      // 1. Insert the deviation using the validated data
      const insertRes = await insertDeviation(data);

      if (insertRes.success) {
        // 2. If insertion is successful, DO NOT delete the original draft
        // const deleteRes = await deleteDraftDeviation(id); // Removed deletion
        toast.success('Odchylenie dodane ze szkicu!'); // Updated message
        redirectToDeviations();
      } else if (insertRes.error) {
        console.error('onSubmit - insertDeviation error:', insertRes.error);
        toast.error('Błąd podczas dodawania odchylenia. Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit error:', error);
      toast.error('Wystąpił nieoczekiwany błąd. Skontaktuj się z IT!');
    } finally {
      setIsPendingInserting(false); // Ensure loading state is always reset
    }
  };

  const handleDraftUpdate = async (
    data: z.infer<typeof addDeviationDraftSchema>,
  ) => {
    setIsPendingUpdatingDraft(true);
    try {
      // Validate against the draft schema before sending
      const validatedData = addDeviationDraftSchema.parse(data);
      const res = await updateDraftDeviation(id, validatedData);
      if (res.success) {
        toast.success('Szkic zapisany!');
        // form.reset(); // Consider if resetting is desired after saving draft
        // redirectToDeviations(); // Removed redirection
      } else if (res.error) {
        console.error('handleDraftUpdate', res.error);
        // Provide more specific error messages if possible
        if (res.error === 'not found') {
          toast.error('Nie znaleziono szkicu do zaktualizowania.');
        } else if (res.error === 'not authorized') {
          toast.error('Nie masz uprawnień do edycji tego szkicu.');
        } else if (res.error === 'not draft') {
          toast.error('Ten element nie jest już szkicem.');
        } else {
          toast.error('Błąd podczas zapisywania szkicu. Skontaktuj się z IT!');
        }
      }
    } catch (error) {
      console.error('handleDraftUpdate error:', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingUpdatingDraft(false);
    }
  };

  const handleDeleteDraft = async () => {
    setIsPendingDeleteDraft(true);
    try {
      const res = await deleteDraftDeviation(id);
      if (res.success) {
        toast.success('Szkic usunięty!');
        redirectToDeviations();
      } else if (res.error) {
        console.error('handleDeleteDraft', res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('handleDeleteDraft', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingDeleteDraft(false);
    }
  };

  return (
    <Card className='sm:w-[768px]'>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          {/* <div> */}
          <CardTitle>Edytowanie szkicu odchylenia</CardTitle>
          {/* <CardDescription>ID: {deviation?._id}</CardDescription> */}
          {/* </div> */}
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
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Numer artykułu</FormLabel>
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
                  <FormLabel>Nazwa artykułu</FormLabel>
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
                    <FormLabel>Nazwa klienta</FormLabel>
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
                        defaultValue={field.value}
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
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <Separator className='mb-4' />

          <CardFooter className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
            <div className='flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:space-x-2'>
              <Button
                variant='destructive'
                type='button'
                onClick={() => form.reset()}
                className='w-full sm:w-auto'
              >
                <Eraser className='' />
                Wyczyść
              </Button>
              <Button
                variant='destructive'
                type='button'
                onClick={handleDeleteDraft}
                disabled={isPendingDeleteDraft}
                className='w-full sm:w-auto'
              >
                <Trash className={isPendingDeleteDraft ? 'animate-spin' : ''} />
                Usuń szkic
              </Button>
            </div>
            <div className='flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:space-x-2'>
              <Button
                variant='secondary'
                type='button'
                onClick={() => handleDraftUpdate(form.getValues())}
                disabled={isPendingUpdateDraft}
                className='w-full sm:w-auto'
              >
                <Pencil
                  className={isPendingUpdateDraft ? 'animate-spin' : ''}
                />
                Zapisz szkic
              </Button>

              <Button
                disabled={
                  isPendingInsert ||
                  isPendingUpdateDraft ||
                  isPendingDeleteDraft
                } // Disable if any action is pending
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
