'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { resetPassword, login } from '../actions';

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
    .min(23, { message: 'E-Mail ist zu kurz!' })
    .regex(/@bruss-group\.com$/, {
      message: 'Die angegebene E-Mail gehört nicht zur Domain bruss-group.com!',
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
      const result = await login(values.email, values.password);

      // if (result?.status === 'logged') {
      //   toast.success('Zalogowano!');
      // }

      if (result?.error) {
        toast.error('Ungültige Anmeldedaten!');
        console.error('User login was unsuccessful.:', result?.error);
        return;
      }
    } catch (error) {
      console.error('User login was unsuccessful.:', error);
      toast.error('Kontaktieren Sie die IT-Abteilung!');
      return;
    } finally {
      setIsPending(false);
    }
  }

  async function onResetPassword() {
    const email = form.getValues('email');
    // console.log('email: ', email);
    if (!email) {
      toast.error('Geben Sie Ihre E-Mail ein, um das Passwort zurückzusetzen!');
      return;
    }
    try {
      setIsPendingSending(true);
      const result = await resetPassword(email);
      if (!result) {
        toast.error('Kontaktieren Sie die IT-Abteilung!');
        return;
      }

      if (result.status === 'sent') {
        toast.success('Link zum Zurücksetzen des Passworts gesendet!');
        return;
      }

      if (result?.error) {
        toast.error('Kontaktieren Sie die IT-Abteilung!');
        console.error('User password reset was unsuccessful.:', result?.error);
      }

      if (result.status === 'not exists') {
        toast.error(
          'Kein Benutzer unter der angegebenen E-Mail-Adresse gefunden!',
        );
        return;
      }
    } catch (error) {
      console.error('User password reset was unsuccessful.:', error);
      toast.error('Kontaktieren Sie die IT-Abteilung!');
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
                  <FormLabel>Passwort</FormLabel>
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
                Versenden einer E-Mail
              </Button>
            ) : (
              <Button
                onClick={onResetPassword}
                type='button'
                variant='destructive'
              >
                Passwort zurücksetzen
              </Button>
            )}
            {isPending ? (
              <Button disabled>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Logging
              </Button>
            ) : (
              <Button type='submit'>Anmelden</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
