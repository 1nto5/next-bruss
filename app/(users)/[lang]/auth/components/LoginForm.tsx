'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { resetPassword, login } from '../actions';
// import { AuthError } from 'next-auth';

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
  // CardHeader,
  // CardTitle,
  // CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginForm({ cDict }: { cDict: any }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isPendingSending, setIsPendingSending] = useState(false);

  const formSchema = z.object({
    email: z
      .string()
      .min(23, { message: cDict.zod.emailTooShort })
      .regex(/@bruss-group\.com$/, {
        message: cDict.zod.emailNotFromBruss,
      }),
    password: z.string().min(1, { message: cDict.zod.passwordEmpty }),
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
      await login(values.email, values.password);
      // if (!res) {
      //   toast.error('Nieprawidłowe dane logowania!');
      //   return;
      // }
      // console.log('res: ', res);
    } catch (error) {
      // console.error(error);
      // toast.error('Skontaktuj się z IT!');
      toast.error(cDict.toasts.loginError);
      return;
    } finally {
      setIsPending(false);
    }
  }

  async function onResetPassword() {
    const email = form.getValues('email');
    // console.log('email: ', email);
    if (!email) {
      toast.error(cDict.toasts.resetPasswordNoEmail);
      return;
    }
    try {
      setIsPendingSending(true);
      const result = await resetPassword(email);
      if (!result) {
        toast.error(cDict.toasts.pleaseContactIt);
        return;
      }

      if (result.status === 'success') {
        toast.success(cDict.toasts.resetPasswordEmailSent);
        return;
      }

      if (result?.error) {
        toast.error(cDict.toasts.pleaseContactIt);
        console.error('User password reset was unsuccessful.:', result?.error);
      }

      if (result.status === 'not exists') {
        toast.error(cDict.toasts.noUserWithThisEmail);
        return;
      }
    } catch (error) {
      console.error('User password reset was unsuccessful.:', error);
      toast.error(cDict.toasts.pleaseContactIt);
      return;
    } finally {
      setIsPendingSending(false);
    }
  }

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>Wprowadź dane logowania</CardTitle>
        <CardDescription>Wprowadź dane aby się zalogować:</CardDescription>
      </CardHeader> */}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='mt-4 grid w-full items-center gap-4'>
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
          <CardFooter className='flex justify-between'>
            {/* uncommnet after exchange implementation */}
            {/* {isPendingSending ? (
              <Button type='button' variant='destructive' disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {cDict.emailSendingButton}
              </Button>
            ) : (
              <Button
                onClick={onResetPassword}
                type='button'
                variant='destructive'
              >
                {cDict.resetPasswordButton}
              </Button>
            )} */}
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
