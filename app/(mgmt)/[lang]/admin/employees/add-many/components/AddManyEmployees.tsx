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
  // FormLabel,
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
import { insertManyEmployee } from '../../actions';
// import Link from 'next/link';
// import { useQuery } from '@tanstack/react-query';

export default function AddEmployee({ lang }: { lang: string }) {
  const formSchema = z.object({
    pastedEmployees: z
      .string()
      .min(10, { message: 'Paste export from hydra to add' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pastedEmployees: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await insertManyEmployee(data.pastedEmployees);

      if (res?.success) {
        if (res?.success === 1) {
          toast.success('Employee saved successfully!');
        } else if (res?.success > 1) {
          toast.success(`${res?.success} new employees saved successfully!`);
        } else {
          toast.error('The employees listed already exist!');
        }
        form.reset();
      } else {
        toast.error('Unknown problem during saving employees');
      }
    } catch (error) {
      console.error('Error inserting employees:', error);
      toast.error('Please contact IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>Add many employees</CardTitle>
        <CardDescription>
          Paste columns B and C from the HYDRA export file
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
              name='pastedEmployees'
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>First name</FormLabel> */}
                  <FormControl>
                    <Textarea
                      autoFocus
                      placeholder={`Kowalski, Jan\tABABA
Nowak, Anna\tBCBCD
Wiśniewski, Piotr\tCCDCE
Zielińska, Maria\tDDEDF
Wójcik, Tomasz\tEEFEE
Lewandowska, Karolina\tAFBAF
Kozłowski, Paweł\tBGGBG`}
                      {...field}
                    />
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
