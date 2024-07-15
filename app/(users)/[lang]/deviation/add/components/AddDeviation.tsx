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
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { insertDeviation } from '../../actions';
import Link from 'next/link';
import { Table } from 'lucide-react';
import { addDeviationSchema } from '@/lib/z/addDeviation';

export default function AddDeviation() {
  const form = useForm<z.infer<typeof addDeviationSchema>>({
    resolver: zodResolver(addDeviationSchema),
    defaultValues: {
      articleNumber: '',
      articleName: '',
      workplace: '',
      periodFrom: new Date(),
      periodTo: new Date(),
      reason: '',
      description: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof addDeviationSchema>) => {
    setIsPending(true);
    try {
      const res = await insertDeviation(data);
      if (res?.success) {
        toast.success('CAPA zapisana!');
        // form.reset()
      } else if (res?.error) {
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>Dodaj nowe odchylenie</CardTitle>
        {/* <CardDescription>{cDict.cardDescription}</CardDescription> */}
        <div className='flex items-center justify-end py-4'>
          <Link href='/deviation'>
            <Button className='mr-2 justify-end' variant='outline'>
              <Table />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artykuł</FormLabel>
                  <FormControl>
                    <Input
                      className='w-[120px]'
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
              name='description'
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>First name</FormLabel> */}
                  <FormControl>
                    <Textarea autoFocus placeholder={``} {...field} />
                  </FormControl>
                  <FormMessage />
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
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Dodawanie
              </Button>
            ) : (
              <Button type='submit'>Dodaj</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
