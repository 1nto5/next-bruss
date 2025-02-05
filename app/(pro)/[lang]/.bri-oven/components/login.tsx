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
          'wrong code 1': 'Ungültiger Anmeldecode!',
          'wrong code 2': 'Ungültiger Anmeldecode!',
          'wrong code 3': 'Ungültiger Anmeldecode!',
        };
        const errorField =
          `operator${res.error.split(' ')[2]}Code` as keyof typeof data;
        form.setError(errorField, {
          type: 'manual',
          message: errorMessages[res.error] || 'Unbekannter Fehler!',
        });
      } else if (res.success) {
        setOperator1(data.operator1Code);
        setOperator2(data.operator2Code || '');
        setOperator3(data.operator3Code || '');
        toast.success('Erfolgreich eingeloggt!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Bitte kontaktieren Sie die IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[400px]'>
      <CardHeader>
        <CardTitle>Anmeldung</CardTitle>
        <CardDescription>
          Scannen Sie Ihren Code von Ihrer Mitarbeiterkarte, um sich anzumelden.
          Sie können 3 Operatoren gleichzeitig anmelden.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          // prevent form submission on Enter key - employee use barcode scanners with "auto-enter" feature
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
        >
          <CardContent className='grid w-full items-center gap-4 '>
            <FormField
              control={form.control}
              name='operator1Code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operator 1</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      autoFocus
                      autoComplete='off'
                      placeholder=''
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className='flex flex-row items-center justify-between'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Operator 2</FormLabel>
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
                    {/* <FormLabel>Operator 2</FormLabel> */}
                    <FormControl>
                      <Input
                        type='password'
                        autoComplete='off'
                        placeholder=''
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormItem className='flex flex-row items-center justify-between'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Operator 3</FormLabel>
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
                    {/* <FormLabel>Operator 3</FormLabel> */}
                    <FormControl>
                      <Input
                        type='password'
                        autoComplete='off'
                        placeholder=''
                        {...field}
                      />
                    </FormControl>
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
                Anmelden
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
