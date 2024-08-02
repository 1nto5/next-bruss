// TODO: save draft and go to edit page
// TODO: get article name

'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
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
import { DeviationReasonType } from '@/lib/types/deviation';
import { cn } from '@/lib/utils';
import { addCorrectiveActionSchema } from '@/lib/z/deviation';
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
  insertCorrectiveAction,
  // findArticleName,
  // insertDeviation,
  // insertDraftDeviation,
  redirectToDeviation,
} from '../actions';

export default function AddCorrectiveAction({ id }: { id: string }) {
  // const [isDraft, setIsDraft] = useState<boolean>();
  const [isPendingInsert, setIsPendingInserting] = useState(false);
  const [isPendingInsertDraft, setIsPendingInsertingDraft] = useState(false);
  const [isPendingFindArticleName, startFindArticleNameTransition] =
    useTransition();

  const form = useForm<z.infer<typeof addCorrectiveActionSchema>>({
    resolver: zodResolver(addCorrectiveActionSchema),
    defaultValues: {
      deadline: new Date(new Date().setHours(12, 0, 0, 0) + 86400000),
    },
  });

  const onSubmit = async (data: z.infer<typeof addCorrectiveActionSchema>) => {
    // setIsDraft(false);
    setIsPendingInserting(true);
    try {
      const res = await insertCorrectiveAction(data);
      if (res.success) {
        toast.success('Odchylenie dodane!');
        // form.reset()
        redirectToDeviation(id);
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

  return (
    <Card className='w-[768px]'>
      <CardHeader>
        <div className='flex justify-between'>
          <CardTitle>Nowa akcja korygująca</CardTitle>
          <Link href={`/deviations/${id}`}>
            <Button size='icon' variant='outline'>
              <Table />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Separator className='mb-4' />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* <form
          onSubmit={form.handleSubmit(isDraft ? handleDraftInsert : onSubmit)}
        > */}
          <CardContent className='grid w-full items-center gap-4'>
            <div className='flex space-x-2'>
              <FormField
                control={form.control}
                name='deadline'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Deadline</FormLabel>
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
                            minDate.setDate(today.getDate() + 1);
                            const maxDate = new Date(today);
                            maxDate.setDate(today.getDate() + 90);
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
            </div>
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
