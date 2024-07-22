// TODO: save draft and go to edit page
// TODO: get article name

'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  // CardDescription,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  insertDeviation,
  insertDraftDeviation,
  findArticleName,
} from '../actions';
import Link from 'next/link';
import { Table } from 'lucide-react';
import { addDeviationSchema, addDeviationDraftSchema } from '@/lib/z/deviation';
import { DeviationReasonType } from '@/lib/types/deviation';

export default function AddDeviation({
  reasons,
}: {
  reasons: DeviationReasonType[];
}) {
  const [isDraft, setIsDraft] = useState(false);
  const [isPendingInsert, setIsPendingInserting] = useState(false);
  const [isPendingInsertDraft, setIsPendingInsertingDraft] = useState(false);
  const [isPendingFindArticleName, setIsPendingFindArticleName] =
    useState(false);

  const form = useForm<z.infer<typeof addDeviationSchema>>({
    resolver: zodResolver(
      isDraft ? addDeviationDraftSchema : addDeviationSchema,
    ),
    defaultValues: {
      // articleNumber: '',
      // articleName: '',
      // workplace: '',
      // drawingNumber: '',
      // quantity: '',
      // charge: '',
      // description: '',
      // reason: '',
      periodFrom: new Date(new Date().setHours(0, 0, 0, 0)),
      periodTo: new Date(new Date().setHours(0, 0, 0, 0)),
      // area: '',
      // processSpecification: '',
      // customerNumber: '',
      customerAuthorization: false,
    },
  });

  const handleFindArticleName = async () => {
    setIsPendingFindArticleName(true);
    try {
      const articleNumber = form.getValues('articleNumber');
      if (articleNumber.length === 5) {
        const res = await findArticleName(articleNumber);
        if (res.success) {
          form.setValue('articleName', res.success);
        } else if (res.error === 'not found') {
          toast.error('Nie znaleziono artykułu');
        }
      } else {
        toast.error('Wprowadź poprawny numer artykułu');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingFindArticleName(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof addDeviationSchema>) => {
    setIsDraft(false);
    setIsPendingInserting(true);
    try {
      const res = await insertDeviation(data);
      if (res?.success) {
        toast.success('Odchylenie dodane!');
        // form.reset()
      } else if (res?.error) {
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('An error occurred:', error);
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
      if (res?.success) {
        toast.success('Szkic zapisany!');
        // Możesz przekierować na stronę edycji szkicu tutaj, jeśli jest taka potrzeba
        form.reset();
      } else if (res?.error) {
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingInsertingDraft(false);
    }
  };

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <div className='flex justify-between'>
          <CardTitle>Nowe odchylenie</CardTitle>
          <Link className='ml-4' href='/deviations'>
            <Button variant='outline'>
              <Table />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Form {...form}>
        {/* <form onSubmit={form.handleSubmit(onSubmit)}> */}
        <form
          onSubmit={form.handleSubmit(isDraft ? handleDraftInsert : onSubmit)}
        >
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artykuł</FormLabel>
                  <div className='flex items-center space-x-2'>
                    <FormControl>
                      <Input
                        className='w-[120px]'
                        autoFocus
                        placeholder='12345'
                        {...field}
                      />
                    </FormControl>
                    {isPendingFindArticleName ? (
                      <Button variant='secondary' type='button' disabled>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Pobieranie
                      </Button>
                    ) : (
                      <Button
                        variant='secondary'
                        type='button'
                        onClick={handleFindArticleName}
                      >
                        Pobierz nazwę
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='articleName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa artykułu</FormLabel>
                  <FormControl>
                    <Input
                      className='w-[350px]'
                      placeholder='F-IWDR92,1L-ST'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='workplace'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stanowisko</FormLabel>
                  <FormControl>
                    <Input
                      className='w-[240px]'
                      placeholder='EOL74'
                      {...field}
                    />
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
                    <Input
                      className='w-[350px]'
                      placeholder='24769.08T'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='quantity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ilość</FormLabel>
                  <FormControl>
                    <Input className='w-[120px]' placeholder='997' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='charge'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partia</FormLabel>
                  <FormControl>
                    <Input
                      className='w-[350px]'
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
                            'w-[240px] pl-3 text-left font-normal',
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
                        onSelect={field.onChange}
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
                            'w-[240px] pl-3 text-left font-normal',
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
                        onSelect={field.onChange}
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

            <FormField
              control={form.control}
              name='area'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obszar</FormLabel>
                  <FormControl>
                    <Input className='w-[120px]' placeholder='Q4' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Input className='w-[240px]' placeholder='' {...field} />
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
          <CardFooter className='flex justify-between'>
            <Button
              variant='destructive'
              type='button'
              onClick={() => form.reset()}
            >
              Wyczyść
            </Button>
            <div className='flex space-x-2'>
              {isPendingInsertDraft ? (
                <Button variant='secondary' disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Zapisywanie
                </Button>
              ) : (
                <Button
                  variant='secondary'
                  type='button'
                  onClick={() => {
                    setIsDraft(true);
                    form.handleSubmit(handleDraftInsert)();
                  }}
                >
                  Zapisz szkic
                </Button>
              )}
              {isPendingInsert ? (
                <Button disabled>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Dodawanie
                </Button>
              ) : (
                <Button type='submit'>Dodaj odchylenie</Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
