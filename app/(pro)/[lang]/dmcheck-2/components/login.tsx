'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { login } from '../actions';
import { useOperatorStore } from '../lib/stores';
import { loginSchema as formSchema } from '../lib/zod';
import type { Dictionary } from '../lib/dictionary';

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
import { toast } from 'sonner';

interface LoginProps {
  dict: Dictionary['login'];
}

export default function Login({ dict }: LoginProps) {
  const { setOperator1, setOperator2, setOperator3 } = useOperatorStore();
  const [personalNumber2Form, setPersonalNumber2Form] = useState(false);
  const [personalNumber3Form, setPersonalNumber3Form] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeField, setActiveField] = useState<string>('');
  const [keypadValue, setKeypadValue] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier1: '',
      identifier2: '',
      identifier3: '',
    },
    shouldFocusError: false,
  });

  useEffect(() => {
    if (!personalNumber2Form) {
      form.setValue('identifier2', undefined);
    }
  }, [personalNumber2Form, form]);

  useEffect(() => {
    if (!personalNumber3Form) {
      form.setValue('identifier3', undefined);
    }
  }, [personalNumber3Form, form]);

  useEffect(() => {
    if (showKeypad && activeField) {
      setKeypadValue(getCurrentFieldValue());
    }
  }, [showKeypad, activeField]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await login(data);
      if (res.error) {
        setShowKeypad(false);
        switch (res.error) {
          case 'wrong number 1':
            form.setError('identifier1', {
              type: 'manual',
              message: dict.errors.wrongNumber1,
            });
            break;
          case 'wrong number 2':
            form.setError('identifier2', {
              type: 'manual',
              message: dict.errors.wrongNumber2,
            });
            break;
          case 'wrong number 3':
            form.setError('identifier3', {
              type: 'manual',
              message: dict.errors.wrongNumber3,
            });
            break;
          default:
            toast.error(dict.errors.loginError);
        }
      } else if (res.success) {
        setOperator1(res.operator1 || null);
        setOperator2(res.operator2 || null);
        setOperator3(res.operator3 || null);
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error(dict.errors.loginError);
    } finally {
      setIsPending(false);
    }
  };

  const handleFieldFocus = (fieldName: string) => {
    setActiveField(fieldName);
    setShowKeypad(true);
  };

  const handleKeypadNumberClick = useCallback((number: number) => {
    setKeypadValue((prev) => (prev + number.toString()).slice(0, 10));
  }, []);

  const handleKeypadReset = () => {
    setKeypadValue('');
  };

  const handleKeypadConfirm = () => {
    if (activeField === 'identifier1') {
      form.setValue('identifier1', keypadValue);
    } else if (activeField === 'identifier2') {
      form.setValue('identifier2', keypadValue);
    } else if (activeField === 'identifier3') {
      form.setValue('identifier3', keypadValue);
    }
    setShowKeypad(false);
  };

  const handleKeypadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeypadValue(e.target.value.replace(/\D/g, ''));
  };

  const getCurrentFieldValue = () => {
    if (activeField === 'identifier1') {
      return form.getValues('identifier1') || '';
    } else if (activeField === 'identifier2') {
      return form.getValues('identifier2') || '';
    } else if (activeField === 'identifier3') {
      return form.getValues('identifier3') || '';
    }
    return '';
  };

  return (
    <>
      <Card className='w-full max-w-none'>
        <CardHeader>
          <CardTitle>{dict.title}</CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className='grid w-full items-center gap-4'>
              <FormField
                control={form.control}
                name='identifier1'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.operator1Label}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete='off'
                        placeholder={dict.placeholder}
                        {...field}
                        onFocus={() => handleFieldFocus('identifier1')}
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
                  <FormLabel className='text-base'>{dict.operator2Label}</FormLabel>
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
                  name='identifier2'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dict.personalNumber2Label}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          placeholder={dict.placeholder}
                          {...field}
                          onFocus={() => handleFieldFocus('identifier2')}
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
                  <FormLabel className='text-base'>{dict.operator3Label}</FormLabel>
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
                  name='identifier3'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dict.personalNumber3Label}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          placeholder={dict.placeholder}
                          {...field}
                          onFocus={() => handleFieldFocus('identifier3')}
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
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='animate-spin' />}
                {dict.loginButton}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Dialog open={showKeypad} onOpenChange={setShowKeypad}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {dict.keypadTitle} {activeField.slice(-1)}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleKeypadConfirm();
            }}
            className='space-y-4'
          >
            <Input
              autoFocus
              value={keypadValue}
              onChange={handleKeypadInputChange}
              className='text-center'
              autoComplete='off'
              inputMode='numeric'
              pattern='[0-9]*'
            />
            <div className='grid grid-cols-3 gap-4'>
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
                size='lg'
                variant='outline'
                onClick={() => handleKeypadNumberClick(0)}
                className='col-start-2'
              >
                0
              </Button>
            </div>
            <div className='grid grid-cols-4 gap-4'>
              <Button
                type='button'
                variant='destructive'
                onClick={handleKeypadReset}
                size='lg'
                aria-label={dict.keypadReset || 'Resetuj'}
                className='col-span-1'
              >
                <RotateCcw className='h-6 w-6' />
              </Button>
              <Button 
                type='submit' 
                size='lg' 
                aria-label={dict.keypadSave || 'Zapisz'}
                className='col-span-3'
              >
                {dict.loginButton}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}