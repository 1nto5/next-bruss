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
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { saveUser } from '../../../actions';
import Link from 'next/link';
import { Table } from 'lucide-react';
import { UserType } from '@/lib/types/user';

export default function EditUser({ userObject }: { userObject: UserType }) {
  // it should be under function declaration -> no recreate on every render but how to add translations?
  // const formSchema = z.object({
  //   email: z
  //     .string()
  //     .regex(/@bruss-group\.com$/, {
  //       message: 'Email must be from the @bruss-group.com domain!',
  //     })
  //     .min(23, { message: 'Minimum 23 characters!' }),
  // password: z
  //   .string()
  //   .min(6, { message: 'Minimum 6 characters!' })
  //   .regex(/[^a-zA-Z0-9]/, {
  //     message: 'Password must contain at least one special character!',
  //   }),
  // confirmPassword: z
  //   .string()
  //   .min(1, { message: 'Please confirm password!' }),
  //   roles: z.array(z.string()),
  // });
  // .refine((data) => data.password === data.confirmPassword, {
  //   path: ['confirmPassword'],
  //   message: 'Passwords do not match!',
  // });

  const formSchema = z.object({
    email: z
      .string()
      .regex(/@bruss-group\.com$/, {
        message: 'Email must be from the @bruss-group.com domain!',
      })
      .min(23, { message: 'Minimum 23 characters!' }),
    roles: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: userObject.email,
      // password: '',
      // confirmPassword: '',
      roles: userObject.roles?.toString() ?? '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const user = {
        _id: userObject._id,
        email: data.email,
        roles: data.roles.split(','),
      };
      const res = await saveUser(user);
      if (res?.success) {
        toast.success('User saved!');
      } else if (res?.error) {
        console.error('An error occurred:', res?.error);
        toast.error('An error occurred! Check console for more info.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('An error occurred! Check console for more info.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[550px]'>
      <CardHeader>
        <CardTitle>Edit user</CardTitle>
        {/* <CardDescription>
          Poprzednio edytowany: {date} przez{' '}
          {extractNameFromEmail(data.edited?.email ?? '')}
        </CardDescription> */}
        <div className='flex items-center justify-end py-4'>
          <Link href='/admin/users'>
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
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='roles'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder='' {...field} />
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
