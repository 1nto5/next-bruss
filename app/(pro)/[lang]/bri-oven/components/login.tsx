'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { login } from '../actions';
import { useLogin } from '../lib/stores';
import { ovenLoginSchema as formSchema } from '../lib/zod';

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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Login() {
  const { setOperator1, setOperator2, setOperator3 } = useLogin();
  const [operator2Switch, setOperator2Switch] = useState(false);
  const [operator3Switch, setOperator3Switch] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operator1Code: '',
      operator2Code: '',
      operator3Code: '',
    },
  });

  useEffect(() => {
    if (!operator2Switch) {
      form.setValue('operator2Code', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operator2Switch]);

  useEffect(() => {
    if (!operator3Switch) {
      form.setValue('operator3Code', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operator3Switch]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await login(data);
      if (res.error) {
        const errorMessages: Record<string, string> = {
          'wrong code 1': 'Nieprawidłowy kod logowania!',
          'wrong code 2': 'Nieprawidłowy kod logowania!',
          'wrong code 3': 'Nieprawidłowy kod logowania!',
        };
        const errorField =
          `operator${res.error.split(' ')[2]}Code` as keyof typeof data;
        form.setError(errorField, {
          type: 'manual',
          message: errorMessages[res.error] || 'Nieznany błąd!',
        });
      } else if (res.success) {
        setOperator1(data.operator1Code);
        setOperator2(data.operator2Code || '');
        setOperator3(data.operator3Code || '');
        toast.success('Zalogowano pomyślnie!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[400px]'>
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
        <CardDescription>
          Wpisz dane jednej, dwóch lub trzech osób spisujących w Twojej grupie.
          Jedna osoba loguje całą grupę na jednym urządzeniu.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4 '>
            <FormField
              control={form.control}
              name='operator1Code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nr personalny 1</FormLabel>
                  <FormControl>
                    <Input autoComplete='off' placeholder='' {...field} />
                  </FormControl>
                  {/* <FormDescription>
                        Wprowadź służbowy adres personalNumber.
                      </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className='flex flex-row items-center justify-between'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Osoba 2</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={operator2Switch}
                  onCheckedChange={setOperator2Switch}
                />
              </FormControl>
            </FormItem>

            {operator2Switch && (
              <FormField
                control={form.control}
                name='operator2Code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numer personalny 2</FormLabel>
                    <FormControl>
                      <Input autoComplete='off' placeholder='' {...field} />
                    </FormControl>
                    {/* <FormDescription>
                        Wprowadź służbowy adres personalNumber.
                      </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormItem className='flex flex-row items-center justify-between'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Osoba 3</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={operator3Switch}
                  onCheckedChange={setOperator3Switch}
                />
              </FormControl>
            </FormItem>

            {operator3Switch && (
              <FormField
                control={form.control}
                name='operator3Code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numer personalny 3</FormLabel>
                    <FormControl>
                      <Input autoComplete='off' placeholder='' {...field} />
                    </FormControl>
                    {/* <FormDescription>
                        Wprowadź służbowy adres personalNumber.
                      </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>

          <CardFooter className='flex justify-end'>
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
