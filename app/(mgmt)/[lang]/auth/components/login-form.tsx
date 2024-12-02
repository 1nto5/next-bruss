'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { login } from '../actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginForm({ cDict }: { cDict: any }) {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);

  const formSchema = z.object({
    email: z
      .string()
      .min(23, { message: cDict.zod.emailTooShort })
      .regex(/@bruss-group\.com$/, {
        message: cDict.zod.emailNotFromBruss,
      }),
    password: z.string().min(5, { message: cDict.zod.passwordTooShort }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values.email, values.password);
    try {
      setIsPending(true);
      const res = await login(values.email, values.password);
      if (!res || res.error === 'default error') {
        toast.error(cDict.toasts.pleaseContactIt);
        return;
      }
      if (res.error === 'invalid credentials') {
        form.setError('email', {
          type: 'manual',
          message: cDict.zod.credentialsError,
        });
        form.setError('password', {
          type: 'manual',
          message: cDict.zod.credentialsError,
        });
        return;
      }
      if (res.success) {
        toast.success(cDict.toasts.loginSuccess);
        // router.back();
        router.push('/');
      }
    } catch (error) {
      toast.error(cDict.toasts.pleaseContactIt);
      return;
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className='w-[400px]'>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
        <CardDescription>{cDict.cardDescription}</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.emailInputLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  {/* <FormDescription>
                        Wprowadź służbowy adres email.
                      </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{cDict.passwordInputLabel}</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='' {...field} />
                  </FormControl>
                  {/* <FormDescription>
                        Wprowadź służbowy adres email.
                      </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className='flex justify-end'>
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {cDict.loggingButton}
              </Button>
            ) : (
              <Button type='submit'>{cDict.loginButton}</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
