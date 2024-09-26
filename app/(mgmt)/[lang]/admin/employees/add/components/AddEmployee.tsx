'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
  FormDescription,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Table } from 'lucide-react';
// import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { insertEmployee } from '../../actions';
// import { useQuery } from '@tanstack/react-query';

export default function AddEmployee({ lang }: { lang: string }) {
  const formSchema = z.object({
    firstName: z
      .string()
      .min(3, { message: 'Minimum 3 characters!' })
      .optional(),
    lastName: z
      .string()
      .min(3, { message: 'Minimum 3 characters!' })
      .optional(),
    loginCode: z.string().min(3, { message: 'Minimum 1 character!' }),
    password: z
      .string()
      .min(4, { message: 'Minimum 4 characters!' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Password must contain at least one special character!',
      })
      .optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      loginCode: '',
      password: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    const employee = {
      name: `${data.firstName} ${data.lastName}`,
      loginCode: data.loginCode,
      password: data.password,
    };
    try {
      const res = await insertEmployee(employee);

      if (res?.success) {
        toast.success('Employee config saved successfully!');
        // form.reset(); // Uncomment to reset the form after a successful save.
      } else if (res?.error === 'exists') {
        toast.error('Employee already exists!');
      } else if (res?.error) {
        console.error('Error inserting employee:', res?.error);
        toast.error('An error occurred! Check console for more info.');
      }
    } catch (error) {
      console.error('Error inserting employee config:', error);
      toast.error(
        'An error occurred while inserting the article. Please try again.',
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>Add new employee</CardTitle>
        {/* <CardDescription>
          Poprzednio edytowany: {date} przez{' '}
          {extractNameFromEmail(data.edited?.email ?? '')}
        </CardDescription> */}
        <div className='flex items-center justify-end py-4'>
          <Link href='/admin/employees'>
            <Button className='mr-2' variant='outline'>
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
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='loginCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login code</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>
                    Personal number (MRG) or contents of the employee card code
                    (BRI)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>
                    For inventory support applications - not for DMCheck, leave
                    blank if not in use
                  </FormDescription>
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
