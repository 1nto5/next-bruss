'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  // CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateEmployee } from '../../../actions';
import Link from 'next/link';
import { Table, SquareAsterisk } from 'lucide-react';
import { EmployeeType } from '@/lib/types/employee';

export default function EditEmployee({
  employeeObject,
}: {
  employeeObject: EmployeeType;
}) {
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
      .min(6, { message: 'Minimum 6 characters!' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Password must contain at least one special character!',
      })
      .optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: employeeObject.name.split(' ')[0],
      lastName: employeeObject.name.split(' ')[1],
      loginCode: employeeObject.loginCode,
      password: employeeObject.password,
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const employee = {
        _id: employeeObject._id,
        name: `${data.firstName} ${data.lastName}`,
        loginCode: data.loginCode,
      };
      const res = await updateEmployee(employee);
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
        <CardTitle>Edit employee</CardTitle>
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
                    <Input placeholder='' {...field} />
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
                    <Input placeholder='' {...field} />
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
                    <Input placeholder='' {...field} />
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
                    <Input placeholder='' {...field} />
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
