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
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { saveUser } from '../../../actions';
import { extractNameFromEmail } from '@/lib/utils/nameFormat';
import Link from 'next/link';
import { Table } from 'lucide-react';
import { User } from '../../../table/columns';

export default function EditUser({ data }: { data: User }) {
  // it should be under function declaration -> no recreate on every render but how to add translations?
  const formSchema = z
    .object({
      email: z
        .string()
        .regex(/@bruss-group\.com$/, {
          message: 'Email must be from the @bruss-group.com domain!',
        })
        .min(23, { message: 'Minimum 23 characters!' }),
      password: z
        .string()
        .min(6, { message: 'Minimum 6 characters!' })
        .regex(/[^a-zA-Z0-9]/, {
          message: 'Password must contain at least one special character!',
        }),
      confirmPassword: z
        .string()
        .min(1, { message: 'Please confirm password!' }),
      inventoryApprove: z.boolean(),
      rework: z.boolean(),
      articleConfig: z.boolean(),
      personsConfig: z.boolean(),
      capa: z.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match!',
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: data.email,
      password: '',
      confirmPassword: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const saveUser = async (data: z.infer<typeof formSchema>) => {
        const roles: string[] = [];
        if (data.inventoryApprove) {
          roles.push('inventory-approve');
        }
        if (data.rework) {
          roles.push('rework');
        }
        if (data.articleConfig) {
          roles.push('article-config');
        }
        if (data.personsConfig) {
          roles.push('persons-config');
        }
        if (data.capa) {
          roles.push('capa');
        }

        const updatedUser = {
          ...data,
          roles,
        };

        // Your save user logic here
      };

      const res = await saveUser(user);
      if (res?.success) {
        toast.success('CAPA zapisana!');
      } else if (res?.error) {
        console.error('An error occurred:', res?.error);
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
        <CardTitle>Edit user: {data.email}</CardTitle>
        {/* <CardDescription>
          Poprzednio edytowany: {date} przez{' '}
          {extractNameFromEmail(data.edited?.email ?? '')}
        </CardDescription> */}
        <div className='flex items-center justify-end py-4'>
          <Link href='/capa'>
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
              name='client'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klient</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='line'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linia</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='articleNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artykuł</FormLabel>
                  <FormControl>
                    <Input disabled placeholder='' {...field} />
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
                  <FormLabel>Nazwa art.</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='clientPartNumber'
              render={({ field }) => (
                <FormItem>
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
              name='piff'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIFF</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='processDescription'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis procesu</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='rep160t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 160T</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='rep260t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 260t</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep260t2k'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 260T 2K</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep300t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 300T</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep300t2k'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 300T 2K</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep400t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 400T</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='rep500t'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>REP 500T</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='b50'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>B50</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='b85'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>B85</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='engel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ENGEL</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='eol'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EOL</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='cutter'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obcinarki</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='other'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inne</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='soldCapa'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprzedana CAPA</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='flex'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flex?</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='possibleMax'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Możliwa MAX CAPA</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='comment'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Komentarz</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='sop'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SOP</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='eop'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EOP</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='service'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Czy serwisowy?</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
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
                Zapisywanie
              </Button>
            ) : (
              <Button type='submit'>Zapisz</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
