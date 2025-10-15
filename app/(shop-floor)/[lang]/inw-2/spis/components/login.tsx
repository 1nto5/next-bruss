'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { login } from '../actions';
import { usePersonalNumberStore } from '../lib/stores';
import { inventoryLoginSchema as formSchema } from '../lib/zod';

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
  const { setPersonalNumber1, setPersonalNumber2, setPersonalNumber3 } =
    usePersonalNumberStore();
  const [personalNumber2Form, setPersonalNumber2Form] = useState(false);
  const [personalNumber3Form, setPersonalNumber3Form] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalNumber1: '',
      pin1: '',
      personalNumber2: '',
      pin2: '',
      personalNumber3: '',
      pin3: '',
    },
  });

  useEffect(() => {
    if (!personalNumber2Form) {
      form.setValue('personalNumber2', undefined);
      form.setValue('pin2', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalNumber2Form]);

  useEffect(() => {
    if (!personalNumber3Form) {
      form.setValue('personalNumber3', undefined);
      form.setValue('pin3', undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalNumber3Form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // setIsDraft(false);
    setIsPending(true);
    try {
      const res = await login(data);
      if (res.error) {
        switch (res.error) {
          case 'wrong number 1':
            form.setError('personalNumber1', {
              type: 'manual',
              message: 'Nieprawidłowy nr personalny!',
            });
            break;
          case 'wrong pin 1':
            form.setError('pin1', {
              type: 'manual',
              message: 'Nieprawidłowy PIN!',
            });
            break;
          case 'wrong number 2':
            form.setError('personalNumber2', {
              type: 'manual',
              message: 'Nieprawidłowy nr personalny!',
            });
            break;
          case 'wrong pin 2':
            form.setError('pin2', {
              type: 'manual',
              message: 'Nieprawidłowy PIN!',
            });
            break;
          case 'wrong number 3':
            form.setError('personalNumber3', {
              type: 'manual',
              message: 'Nieprawidłowy nr personalny!',
            });
            break;
          case 'wrong pin 3':
            form.setError('pin3', {
              type: 'manual',
              message: 'Nieprawidłowy PIN!',
            });
            break;
          default:
            toast.error('Skontaktuj się z IT!');
        }
      } else if (res.success) {
        setPersonalNumber1(data.personalNumber1);
        setPersonalNumber2(data.personalNumber2 || '');
        setPersonalNumber3(data.personalNumber3 || '');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='sm:w-[600px]'>
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
        <CardDescription>
          Wpisz dane jednej, dwóch lub trzech osób spisujących w Twojej grupie.
          Jedna osoba loguje całą grupę na jednym urządzeniu.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='personalNumber1'
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
            <FormField
              control={form.control}
              name='pin1'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN 1</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  checked={personalNumber2Form}
                  onCheckedChange={setPersonalNumber2Form}
                />
              </FormControl>
            </FormItem>

            {personalNumber2Form && (
              <>
                <FormField
                  control={form.control}
                  name='personalNumber2'
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

                <FormField
                  control={form.control}
                  name='pin2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN 2</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      {/* <FormDescription>
                        Wprowadź służbowy adres personalNumber.
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormItem className='flex flex-row items-center justify-between'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Osoba 3</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={personalNumber3Form}
                  onCheckedChange={setPersonalNumber3Form}
                />
              </FormControl>
            </FormItem>

            {personalNumber3Form && (
              <>
                <FormField
                  control={form.control}
                  name='personalNumber3'
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

                <FormField
                  control={form.control}
                  name='pin3'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN 3</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      {/* <FormDescription>
                        Wprowadź służbowy adres personalNumber.
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>

          <CardFooter className='flex justify-end'>
            <Button type='submit' disabled={isPending}>
              {isPending && <Loader2 className='animate-spin' />}
              Zaloguj
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
