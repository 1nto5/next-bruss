'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
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
// import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import NoAvailable from '../../../components/NoAvailable';
import { savePersonConfig } from '../actions';
// import { useQuery } from '@tanstack/react-query';

export default function AddPersonConfig({ cDict }: any) {
  // it could be under function declaration -> no recreate on every render but how to add translations?
  const formSchema = z.object({
    firstName: z.string().min(3, { message: cDict.z.firstName }),
    lastName: z.string().min(3, { message: cDict.z.lastName }),
    loginCode: z.string().min(1, { message: cDict.z.loginCode }),
    password: z.optional(z.string().min(5, { message: cDict.z.password })),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      loginCode: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const res = await savePersonConfig(data);
    setIsPending(false);
    if (res?.success) {
      toast.success(cDict.toasts.saved);
      // form.reset();
    } else if (res?.error === 'exists') {
      toast.error(cDict.toasts.exists);
    }
  };

  if (!cDict) return <NoAvailable />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
        <CardDescription>{cDict.cardDescription}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.firstNameFormLabel}</FormLabel>
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
                  <FormLabel>{cDict.lastNameFormLabel}</FormLabel>
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
                  <FormLabel>{cDict.loginCodeFormLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>
                    {cDict.loginCodeFormDescription}
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
                  <FormLabel>{cDict.passwordFormLabel}</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>
                    {cDict.passwordFormDescription}
                  </FormDescription>
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
              {cDict.clearButton}
            </Button>
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {cDict.addingButton}
              </Button>
            ) : (
              <Button type='submit'>{cDict.addButton}</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
