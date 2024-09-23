'use client';

import { newCardSchema as formSchema } from '@/lib/z/inventory';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
// import { login } from '../actions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CardSelection() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalNumber1: undefined,
      password1: undefined,
      personalNumber2: undefined,
      password2: undefined,
    },
  });

  const onSubmitNewCard = async (data: z.infer<typeof formSchema>) => {
    // setIsDraft(false);
    setIsPending(true);
    // try {
    //   const res = await login(data);
    //   if (res.error) {
    //     switch (res.error) {
    //       case 'no person 1':
    //         toast.error('Nie znaleziono osoby 1!');
    //         break;
    //       case 'wrong password 1':
    //         toast.error('Nieprawidłowe hasło dla osoby 1!');
    //         break;
    //       case 'no person 2':
    //         toast.error('Nie znaleziono osoby 2!');
    //         break;
    //       case 'wrong password 2':
    //         toast.error('Nieprawidłowe hasło dla osoby 2!');
    //         break;
    //       default:
    //         toast.error('Skontaktuj się z IT!');
    //     }
    //   } else if (res.success && res.token) {
    //     toast.success('Zalogowano pomyślnie!');
    //     router.push(pathname + `/${res.token}`);
    //   }
    // } catch (error) {
    //   console.error('onSubmit', error);
    //   toast.error('Skontaktuj się z IT!');
    // } finally {
    //   setIsPending(false);
    // }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // setIsDraft(false);
    setIsPending(true);
    // try {
    //   const res = await login(data);
    //   if (res.error) {
    //     switch (res.error) {
    //       case 'no person 1':
    //         toast.error('Nie znaleziono osoby 1!');
    //         break;
    //       case 'wrong password 1':
    //         toast.error('Nieprawidłowe hasło dla osoby 1!');
    //         break;
    //       case 'no person 2':
    //         toast.error('Nie znaleziono osoby 2!');
    //         break;
    //       case 'wrong password 2':
    //         toast.error('Nieprawidłowe hasło dla osoby 2!');
    //         break;
    //       default:
    //         toast.error('Skontaktuj się z IT!');
    //     }
    //   } else if (res.success && res.token) {
    //     toast.success('Zalogowano pomyślnie!');
    //     router.push(pathname + `/${res.token}`);
    //   }
    // } catch (error) {
    //   console.error('onSubmit', error);
    //   toast.error('Skontaktuj się z IT!');
    // } finally {
    //   setIsPending(false);
    // }
  };

  return (
    <Tabs defaultValue='new' className='w-[400px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='new'>Utwórz nową kartę</TabsTrigger>
        <TabsTrigger value='exists'>Wybierz istniejącą kartę</TabsTrigger>
      </TabsList>
      <TabsContent value='new'>
        <Card>
          <CardHeader>
            <CardTitle>Nowa karta</CardTitle>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNewCard)}>
              <CardContent className='grid w-full items-center gap-4 '>
                <FormField
                  control={form.control}
                  name='reason'
                  render={({ field }) => (
                    <FormItem className='space-y-3'>
                      <FormLabel>Wybierz powód:</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className='flex flex-col space-y-1'
                        >
                          {reasons.map((reason) => (
                            <FormItem
                              key={reason._id.toString()}
                              className='flex items-center space-x-3 space-y-0'
                            >
                              <FormControl>
                                <RadioGroupItem value={reason.content} />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                {reason.content}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
      </TabsContent>
      <TabsContent value='exists'>
        <Card>
          <CardHeader>
            <CardTitle>Logowanie pary inwentaryzującej</CardTitle>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className='grid w-full items-center gap-4 '>
                <FormField
                  control={form.control}
                  name='personalNumber1'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numer personalny 1</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          autoComplete='off'
                          placeholder=''
                          {...field}
                        />
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
                  name='password1'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hasło 1</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='' {...field} />
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
                  name='personalNumber2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numer personalny 2</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          autoComplete='off'
                          placeholder=''
                          {...field}
                        />
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
                  name='password2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hasło 2</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='' {...field} />
                      </FormControl>
                      {/* <FormDescription>
                        Wprowadź służbowy adres personalNumber.
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
                    Logowanie
                  </Button>
                ) : (
                  <Button type='submit'>Zaloguj</Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
