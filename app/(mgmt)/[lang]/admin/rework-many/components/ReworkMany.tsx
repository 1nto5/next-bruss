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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  // CardDescription,
} from '@/components/ui/card';

// import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { markAsRework } from '../actions';
// import Link from 'next/link';
// import { useQuery } from '@tanstack/react-query';

export default function ReworkMany() {
  const formSchema = z.object({
    positions: z
      .string()
      .min(6, { message: 'Enter at least one batch or dmc' }),
    reason: z.string().min(6, { message: 'Enter a reason' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      positions: '',
      reason: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await markAsRework(data.positions, data.reason);
      if (res !== undefined) {
        if (res.success === 1) {
          toast.success('One DMC has been marked as rework!');
        } else if (res.success > 1) {
          toast.success(`${res.success} DMCs have been marked as rework!`);
        } else {
          toast.error('No DMCs found!');
        }
        form.reset();
      } else {
        toast.error('Unknown problem during marking as rework');
      }
    } catch (error) {
      console.error('Error when marking as rework:', error);
      toast.error('Please contact IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>Rework many</CardTitle>
        <CardDescription>
          Please enter the positions (can be multiple DMCs and batches during
          one operation) and the reason for rework.
        </CardDescription>
        {/* <div className='flex items-center justify-end py-4'>
          <Link href='/admin/employees'>
            <Button className='mr-2' variant='outline'>
              <Table />
            </Button>
          </Link>
        </div> */}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='positions'
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel></FormLabel> */}
                  <FormControl>
                    <Textarea
                      autoFocus
                      placeholder={`HH3FQ6S14I
AA0D44C0D2
7952875081895021023030700229`}
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
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className='flex justify-end'>
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving
              </Button>
            ) : (
              <Button type='submit'>Save</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
