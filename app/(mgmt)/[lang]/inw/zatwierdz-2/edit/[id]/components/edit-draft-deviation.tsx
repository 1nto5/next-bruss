'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  // FormDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DeviationReasonType, DeviationType } from '@/lib/types/deviation';
import { cn } from '@/lib/utils';
import { addDeviationDraftSchema, addDeviationSchema } from '@/lib/z/deviation';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  AArrowDown,
  CalendarIcon,
  Eraser,
  Loader2,
  Pencil,
  Plus,
  Table,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  findArticleName,
  insertDeviationFromDraft,
  redirectToDeviations,
  updateDraftDeviation,
} from '../actions';

export default function EditDraftDeviation({
  reasons,
  deviation,
}: {
  reasons: DeviationReasonType[];
  deviation: DeviationType | null;
}) {
  const [isPendingInsert, setIsPendingInserting] = useState(false);
  const [isPendingUpdateDraft, setIsPendingUpdatingDraft] = useState(false);
  const [isPendingFindArticleName, startFindArticleNameTransition] =
    useTransition();

  console.log('deviation', deviation);
  const form = useForm<z.infer<typeof addDeviationSchema>>({
    resolver: zodResolver(addDeviationSchema),
    defaultValues: {
      articleNumber: deviation?.articleNumber || undefined,
      articleName: deviation?.articleName || undefined,
      workplace: deviation?.workplace || undefined,
      area: deviation?.area || undefined,
      drawingNumber: deviation?.drawingNumber || undefined,
      quantity: deviation?.quantity?.value?.toString() || undefined,
      unit: deviation?.quantity?.unit || undefined,
      charge: deviation?.charge || undefined,
      description: deviation?.description || undefined,
      reason: deviation?.reason || undefined,
      periodFrom: deviation?.timePeriod.from
        ? new Date(deviation.timePeriod.from)
        : new Date(new Date().setHours(12, 0, 0, 0)),
      periodTo: deviation?.timePeriod.to
        ? new Date(deviation.timePeriod.to)
        : new Date(new Date().setHours(12, 0, 0, 0)),
      processSpecification: deviation?.processSpecification || undefined,
      customerNumber: deviation?.customerNumber || undefined,
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
    if (!deviation?.id) {
      console.error('onSubmit', 'deviation.id is missing');
      toast.error('Skontaktuj się z IT!');
      return;
    }
    try {
      const res = await insertDeviationFromDraft(deviation.id, data);
      if (res.success) {
        toast.success('Odchylenie dodane!');
        // form.reset()
        redirectToDeviations();
      } else if (res.error) {
        console.error('onSubmit', res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingInserting(false);
    }
  };

  const handleDraftUpdate = async (
    data: z.infer<typeof addDeviationDraftSchema>,
  ) => {
    setIsPendingUpdatingDraft(true);
    if (!deviation?.id) {
      console.error('onSubmit', 'deviation.id is missing');
      toast.error('Skontaktuj się z IT!');
      return;
    }
    try {
      const res = await updateDraftDeviation(deviation?.id, data);
      if (res.success) {
        toast.success('Szkic zapisany!');
        // form.reset();
        redirectToDeviations();
      } else if (res.error) {
        console.error('handleDraftUpdate', res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('handleDraftUpdate', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingUpdatingDraft(false);
    }
  };

  return (
    <Card className='w-[768px]'>
      <CardHeader>
        <div className='flex justify-between'>
          <CardTitle>Edytowanie szkicu odchylenia</CardTitle>
          <Link href='/deviations'>
            <Button size='icon' variant='outline'>
              <Table />
            </Button>
          </Link>
        </div>
        <CardDescription>ID: {deviation?.id}</CardDescription>
      </CardHeader>
      <Separator className='mb-4' />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* <form
          onSubmit={form.handleSubmit(isDraft ? handleDraftUpdate : onSubmit)}
        > */}
          <CardContent className='grid w-full items-center gap-4'>
            <div className='flex space-x-2'>
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
            </div>

            <div className='flex space-x-2'>
              <FormField
                control={form.control}
                name='workplace'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stanowisko</FormLabel>
                    <FormControl>
                      <Input className='w-36' placeholder='EOL74' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='area'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obszar</FormLabel>
                    <FormControl>
                      <Input className='w-16' placeholder='Q4' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='drawingNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numer rysunku</FormLabel>
                  <FormControl>
                    <Input
                      className='w-36'
                      placeholder='24769.08T'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex space-x-4'>
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ilość</FormLabel>
                    <FormControl>
                      <Input className='w-20' placeholder='997' {...field} />
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
                        className='flex flex-col'
                      >
                        <FormItem
                          key={'pcs'}
                          className='flex items-center space-x-3 space-y-0'
                        >
                          <FormControl>
                            <RadioGroupItem value='pcs' />
                          </FormControl>
                          <FormLabel className='font-normal'>szt.</FormLabel>
                        </FormItem>
                        <FormItem
                          key={'kg'}
                          className='flex items-center space-x-3 space-y-0'
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
                    <Input
                      className='w-72'
                      placeholder='MATC188678/188352/188501/188679'
                      {...field}
                    />
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
                      {reasons.map((reason) => (
                        <FormItem
                          key={reason._id.toString()}
                          className='flex items-center space-x-3 space-y-0'
                        >
                          <FormControl>
                            <RadioGroupItem value={reason.content} />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            {reason.content}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex space-x-2'>
              <FormField
                control={form.control}
                name='periodFrom'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Odchylenie od</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-56 pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              date.setHours(12, 0, 0, 0);
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            const minDate = new Date(today);
                            minDate.setDate(today.getDate() - 7);
                            const maxDate = new Date(today);
                            maxDate.setDate(today.getDate() + 7);
                            return date < minDate || date > maxDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='periodTo'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Odchylenie do</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-56 pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              date.setHours(12, 0, 0, 0);
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            const maxDate = new Date(today);
                            maxDate.setDate(today.getDate() + 180);
                            return date < today || date > maxDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {/* <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription> */}
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

          <CardFooter className='flex justify-between'>
            <Button
              variant='destructive'
              type='button'
              onClick={() => form.reset()}
            >
              <Eraser className='mr-2 h-4 w-4' />
              Wyczyść
            </Button>
            <div className='flex space-x-2'>
              {isPendingUpdateDraft ? (
                <Button variant='secondary' disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Zapisywanie
                </Button>
              ) : (
                <Button
                  variant='secondary'
                  type='button'
                  onClick={() => {
                    // setIsDraft(true);
                    // form.handleSubmit(handleDraftUpdate)();
                    handleDraftUpdate(form.getValues());
                  }}
                >
                  <Pencil className='mr-2 h-4 w-4' />
                  Zapisz szkic
                </Button>
              )}
              {isPendingInsert ? (
                <Button disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Dodawanie
                </Button>
              ) : (
                <Button type='submit'>
                  <Plus className='mr-2 h-4 w-4' />
                  Dodaj odchylenie
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
