'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { signIn } from 'next-auth/react';
import { sentResetPasswordEmail } from '../actions';

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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const formSchema = z.object({
  password: z
    .string()
    .min(6, { message: 'Hasło musi zawierać co najmniej 6 znaków!' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Hasło musi zawierać przynajmniej jeden znak specjalny!',
    }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Potiwerdzenie hasła jest wymagane!' }),
});

export default function Reset() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values.email, values.password);
    try {
      setIsPending(true);
      const result = await signIn('credentials', {
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

  return (
    <Card className='w-[400px]'>
      <CardHeader>
        <CardTitle>Ustal nowe hasło</CardTitle>
        {/* <CardDescription>Wprowadź dane aby się zalogować:</CardDescription> */}
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='mt-4 grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nowe hasło</FormLabel>
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
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Powtórz hasło</FormLabel>
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
                Zapisywanie
              </Button>
            ) : (
              <Button type='submit'>Zatwierdź</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
