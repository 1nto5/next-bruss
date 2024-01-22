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
  // CardHeader,
  // CardTitle,
  // CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { register } from '../actions';
import { toast } from 'sonner';

const formSchema = z
  .object({
    email: z
      .string()
      .regex(/@bruss-group\.com$/, {
        message: 'Podany email nie należy do domeny bruss-group.com!',
      })
      .min(23, { message: 'Email jest za krótki!' }),
    password: z
      .string()
      .min(6, { message: 'Hasło musi zawierać co najmniej 6 znaków!' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Hasło musi zawierać przynajmniej jeden znak specjalny!',
      }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Potiwerdzenie hasła jest wymagane!' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Hasła nie są zgodne!',
  });

export default function RegisterForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values.email, values.password);
    try {
      setIsPending(true);

      const result = await register(values.email, values.password);

      if (result?.status === 'registered') {
        toast.success('Konto zostało utworzone!');
        router.replace('/auth');
      }
      if (result?.status === 'exists') {
        toast.error('Konto istnieje!');
        return;
      }
      if (result?.error) {
        toast.error('Skontaktuj się z IT!');
        console.log('User registration was unsuccessful.:', result?.error);
        return;
      }
    } catch (error) {
      console.error('User registration was unsuccessful.:', error);
      toast.error('Skontaktuj się z IT!');
      return;
    } finally {
      setIsPending(false);
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
                Rejestracja
              </Button>
            ) : (
              <Button type='submit'>Zarejestruj</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
