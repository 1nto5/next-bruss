'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { login } from '../actions';
import { usePersonalNumberStore } from '../lib/stores';
import { loginSchema as formSchema } from '../lib/zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Check, Loader2, RotateCcw } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export default function Login() {
  const { setOperator1, setOperator2, setOperator3 } = usePersonalNumberStore();
  const [personalNumber2Form, setPersonalNumber2Form] = useState(false);
  const [personalNumber3Form, setPersonalNumber3Form] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeField, setActiveField] = useState<string>('');

  // Add local state for keypad input
  const [keypadValue, setKeypadValue] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalNumber1: '',
      personalNumber2: '',
      personalNumber3: '',
    },
    shouldFocusError: false, // Prevent auto-focusing fields on validation error
  });

  useEffect(() => {
    if (!personalNumber2Form) {
      form.setValue('personalNumber2', undefined);
    }
  }, [personalNumber2Form]);

  useEffect(() => {
    if (!personalNumber3Form) {
      form.setValue('personalNumber3', undefined);
    }
  }, [personalNumber3Form]);

  // When opening keypad, set value to current field
  useEffect(() => {
    if (showKeypad && activeField) {
      setKeypadValue(getCurrentFieldValue());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showKeypad, activeField]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await login(data);
      if (res.error) {
        setShowKeypad(false); // Close keypad dialog on error
        switch (res.error) {
          case 'wrong number 1':
            form.setError('personalNumber1', {
              type: 'manual',
              message: 'Nieprawidłowy nr personalny!',
            });
            break;
          case 'wrong number 2':
            form.setError('personalNumber2', {
              type: 'manual',
              message: 'Nieprawidłowy nr personalny!',
            });
            break;
          case 'wrong number 3':
            form.setError('personalNumber3', {
              type: 'manual',
              message: 'Nieprawidłowy nr personalny!',
            });
            break;
          default:
            toast.error('Skontaktuj się z IT!');
        }
      } else if (res.success && res.operators) {
        // Set operators in store with their full data
        if (res.operators[0]) {
          setOperator1(res.operators[0]);
        }
        if (res.operators[1]) {
          setOperator2(res.operators[1]);
        }
        if (res.operators[2]) {
          setOperator3(res.operators[2]);
        }
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPending(false);
    }
  };

  const handleFieldFocus = (fieldName: string) => {
    setActiveField(fieldName);
    setShowKeypad(true);
  };

  // Handle keypad number click
  const handleKeypadNumberClick = useCallback((number: number) => {
    setKeypadValue((prev) => (prev + number.toString()).slice(0, 10)); // limit length if needed
  }, []);

  // Handle keypad reset
  const handleKeypadReset = () => {
    setKeypadValue('');
    if (activeField === 'personalNumber1') {
      form.setValue('personalNumber1', '');
    } else if (activeField === 'personalNumber2') {
      form.setValue('personalNumber2', '');
    } else if (activeField === 'personalNumber3') {
      form.setValue('personalNumber3', '');
    }
  };

  // Handle keypad confirm (Login button)
  const handleKeypadConfirm = () => {
    if (activeField === 'personalNumber1') {
      form.setValue('personalNumber1', keypadValue);
    } else if (activeField === 'personalNumber2') {
      form.setValue('personalNumber2', keypadValue);
    } else if (activeField === 'personalNumber3') {
      form.setValue('personalNumber3', keypadValue);
    }
    setShowKeypad(false);
  };

  // Handle keypad input change (manual typing, optional)
  const handleKeypadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeypadValue(e.target.value.replace(/\D/g, ''));
  };

  const handleKeypadBackspace = () => {
    if (activeField === 'personalNumber1') {
      const currentValue = form.getValues('personalNumber1') || '';
      form.setValue('personalNumber1', currentValue.slice(0, -1));
    } else if (activeField === 'personalNumber2') {
      const currentValue = form.getValues('personalNumber2') || '';
      form.setValue('personalNumber2', currentValue.slice(0, -1));
    } else if (activeField === 'personalNumber3') {
      const currentValue = form.getValues('personalNumber3') || '';
      form.setValue('personalNumber3', currentValue.slice(0, -1));
    }
  };

  const handleKeypadClear = () => {
    if (activeField === 'personalNumber1') {
      form.setValue('personalNumber1', '');
    } else if (activeField === 'personalNumber2') {
      form.setValue('personalNumber2', '');
    } else if (activeField === 'personalNumber3') {
      form.setValue('personalNumber3', '');
    }
  };

  const getCurrentFieldValue = () => {
    if (activeField === 'personalNumber1') {
      return form.getValues('personalNumber1') || '';
    } else if (activeField === 'personalNumber2') {
      return form.getValues('personalNumber2') || '';
    } else if (activeField === 'personalNumber3') {
      return form.getValues('personalNumber3') || '';
    }
    return '';
  };

  return (
    <>
      <Card className='w-full max-w-none'>
        <CardHeader>
          <CardTitle>Logowanie</CardTitle>
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
                      <Input
                        autoComplete='off'
                        placeholder='dotknij aby wprowadzić...'
                        {...field}
                        onFocus={() => handleFieldFocus('personalNumber1')}
                        readOnly
                        className='text-center'
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
                    checked={personalNumber2Form}
                    onCheckedChange={setPersonalNumber2Form}
                  />
                </FormControl>
              </FormItem>

              {personalNumber2Form && (
                <FormField
                  control={form.control}
                  name='personalNumber2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numer personalny 2</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          placeholder='dotknij aby wprowadzić...'
                          {...field}
                          onFocus={() => handleFieldFocus('personalNumber2')}
                          readOnly
                          className='text-center'
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
                    checked={personalNumber3Form}
                    onCheckedChange={setPersonalNumber3Form}
                  />
                </FormControl>
              </FormItem>

              {personalNumber3Form && (
                <FormField
                  control={form.control}
                  name='personalNumber3'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numer personalny 3</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          placeholder='dotknij aby wprowadzić...'
                          {...field}
                          onFocus={() => handleFieldFocus('personalNumber3')}
                          readOnly
                          className='text-center'
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
                  Logowanie
                </Button>
              ) : (
                <Button type='submit'>Zaloguj</Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Dialog open={showKeypad} onOpenChange={setShowKeypad}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              Wprowadź numer personalny operatora {activeField.slice(-1)}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleKeypadConfirm();
            }}
            className='grid grid-cols-3 gap-4'
          >
            <Input
              autoFocus
              value={keypadValue}
              onChange={handleKeypadInputChange}
              className='col-span-3 text-center'
              autoComplete='off'
              inputMode='numeric'
              pattern='[0-9]*'
            />
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <Button
                key={number}
                type='button'
                size='lg'
                variant='outline'
                onClick={() => handleKeypadNumberClick(number)}
              >
                {number}
              </Button>
            ))}
            <Button
              type='button'
              variant='destructive'
              onClick={handleKeypadReset}
              size='lg'
              aria-label='Reset'
            >
              <RotateCcw className='h-6 w-6' />
            </Button>
            <Button
              type='button'
              size='lg'
              variant='outline'
              onClick={() => handleKeypadNumberClick(0)}
            >
              0
            </Button>
            <Button type='submit' size='lg' aria-label='Save'>
              <Check className='h-6 w-6' />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
