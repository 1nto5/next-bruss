'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { signIn } from 'next-auth/react';
import { resetPassword } from '../actions';

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

const formSchema = z.object({
  email: z
    .string()
    .min(23, { message: 'Email jest za krótki!' })
    .regex(/@bruss-group\.com$/, {
      message: 'Podany email nie należy do domeny bruss-group.com!',
    }),
  password: z.string(),
});

export default function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isPendingSending, setIsPendingSending] = useState(false);

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
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Niepoprawne dane logowania!');
        console.error('User login was unsuccessful.:', result?.error);
        return;
      } else {
        toast.success('Zalogowano!');
        router.replace('/');
      }
    } catch (error) {
      console.error('User login was unsuccessful.:', error);
      toast.error('Skontaktuj się z IT!');
      return;
    } finally {
      setIsPending(false);
    }
  }

  async function onResetPassword() {
    const email = form.getValues('email');
    console.log('email: ', email);
    if (!email) {
      toast.error('Wprowadź email by zresetować hasło!');
      return;
    }
    try {
      setIsPendingSending(true);
      const result = await resetPassword(email);
      if (!result) {
        toast.error('Skontaktuj się z IT!');
        return;
      }

      if (result.status === 'sent') {
        toast.success('Wysłano link do resetowania hasła!');
        return;
      }

      if (result?.error) {
        toast.error('Skontaktuj się z IT!');
        console.error('User password reset was unsuccessful.:', result?.error);
      }

      if (result.status === 'not exists') {
        toast.error('Brak użytkownika o podanym adresie email!');
        return;
      }
    } catch (error) {
      console.error('User password reset was unsuccessful.:', error);
      toast.error('Skontaktuj się z IT!');
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
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Hasło</FormLabel>
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
            {isPendingSending ? (
              <Button type='button' variant='destructive' disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Wysyłanie email
              </Button>
            ) : (
              <Button
                onClick={onResetPassword}
                type='button'
                variant='destructive'
              >
                Reset hasła
              </Button>
            )}
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Logowanie
              </Button>
            ) : (
              <Button type='submit'>Zaloguj</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
