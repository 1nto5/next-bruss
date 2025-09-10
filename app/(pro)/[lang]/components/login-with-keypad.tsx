'use client';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CircleX, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import NumericKeypadDialog from './numeric-keypad-dialog';

// Generic login schema that can be customized
const createLoginSchema = (
  requireOperator2: boolean,
  requireOperator3: boolean,
  errorMessages?: {
    requiredNumber1?: string;
    requiredNumber2?: string;
    requiredNumber3?: string;
  },
) => {
  return z.object({
    identifier1: z.string().min(1, errorMessages?.requiredNumber1 || 'Required'),
    identifier2: requireOperator2
      ? z.string().min(1, errorMessages?.requiredNumber2 || 'Required')
      : z.string().optional(),
    identifier3: requireOperator3
      ? z.string().min(1, errorMessages?.requiredNumber3 || 'Required')
      : z.string().optional(),
  });
};

export type LoginFormData = {
  identifier1: string;
  identifier2?: string;
  identifier3?: string;
};

export interface LoginWithKeypadProps {
  loginAction: (data: LoginFormData) => Promise<any>;
  onSuccess: (result: any) => void;
  title?: string;
  operator1Label?: string;
  operator2Label?: string;
  operator3Label?: string;
  personalNumber2Label?: string;
  personalNumber3Label?: string;
  placeholder?: string;
  loginButton?: string;
  clearButton?: string;
  keypadTitle?: string;
  errors?: {
    wrongNumber1?: string;
    wrongNumber2?: string;
    wrongNumber3?: string;
    requiredNumber1?: string;
    requiredNumber2?: string;
    requiredNumber3?: string;
    loginError?: string;
  };
}

export default function LoginWithKeypad({
  loginAction,
  onSuccess,
  title = 'Login',
  operator1Label = 'Operator 1',
  operator2Label = 'Operator 2',
  operator3Label = 'Operator 3',
  personalNumber2Label = 'Personal Number 2',
  personalNumber3Label = 'Personal Number 3',
  placeholder = 'Touch to enter...',
  loginButton = 'Login',
  clearButton = 'Clear',
  keypadTitle = 'Enter personal number',
  errors = {
    wrongNumber1: 'Wrong number 1',
    wrongNumber2: 'Wrong number 2',
    wrongNumber3: 'Wrong number 3',
    requiredNumber1: 'Personal number 1 is required',
    requiredNumber2: 'Personal number 2 is required',
    requiredNumber3: 'Personal number 3 is required',
    loginError: 'Login failed',
  },
}: LoginWithKeypadProps) {
  const [personalNumber2Form, setPersonalNumber2Form] = useState(false);
  const [personalNumber3Form, setPersonalNumber3Form] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeField, setActiveField] = useState<string>('');
  const [keypadValue, setKeypadValue] = useState('');
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(
      createLoginSchema(personalNumber2Form, personalNumber3Form, {
        requiredNumber1: errors.requiredNumber1,
        requiredNumber2: errors.requiredNumber2,
        requiredNumber3: errors.requiredNumber3,
      }),
    ),
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

  const handleFieldFocus = useCallback(
    (fieldName: string) => {
      setActiveField(fieldName);
      const currentValue =
        form.getValues(fieldName as keyof LoginFormData) || '';
      setKeypadValue(currentValue);
      setShowKeypad(true);
    },
    [form],
  );

  const handleKeypadConfirm = useCallback(() => {
    if (activeField === 'identifier1') {
      form.setValue('identifier1', keypadValue);
    } else if (activeField === 'identifier2') {
      form.setValue('identifier2', keypadValue);
    } else if (activeField === 'identifier3') {
      form.setValue('identifier3', keypadValue);
    }
    setShowKeypad(false);
    setKeypadValue('');
  }, [activeField, keypadValue, form]);

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsPending(true);
    try {
      const res = await loginAction(data);
      if (res.error) {
        switch (res.error) {
          case 'wrong number 1':
            form.setError('identifier1', {
              type: 'manual',
              message: errors.wrongNumber1!,
            });
            break;
          case 'wrong number 2':
            form.setError('identifier2', {
              type: 'manual',
              message: errors.wrongNumber2!,
            });
            break;
          case 'wrong number 3':
            form.setError('identifier3', {
              type: 'manual',
              message: errors.wrongNumber3!,
            });
            break;
          default:
            toast.error(errors.loginError!);
        }
      } else if (res.success) {
        onSuccess(res);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(errors.loginError!);
    } finally {
      setIsPending(false);
    }
  };

  const getFieldNumber = (field: string) => {
    const match = field.match(/\d+$/);
    return match ? match[0] : '';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <CardContent className='grid w-full items-center gap-6'>
              <FormField
                control={form.control}
                name='identifier1'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{operator1Label}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete='off'
                        placeholder={placeholder}
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
                <div className=''>
                  <FormLabel>{operator2Label}</FormLabel>
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
                    <FormItem className=''>
                      <FormLabel>{personalNumber2Label}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          placeholder={placeholder}
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
                <div className=''>
                  <FormLabel>{operator3Label}</FormLabel>
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
                    <FormItem className=''>
                      <FormLabel>{personalNumber3Label}</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='off'
                          placeholder={placeholder}
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

            <CardFooter>
              <div className='flex w-full gap-4'>
                <Button
                  type='button'
                  variant='destructive'
                  className='w-1/4'
                  onClick={() => {
                    form.reset();
                    setPersonalNumber2Form(false);
                    setPersonalNumber3Form(false);
                  }}
                >
                  <CircleX />
                  {clearButton}
                </Button>
                <Button type='submit' disabled={isPending} className='w-3/4'>
                  {isPending ? <Loader2 className='animate-spin' /> : <Check />}
                  {loginButton}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <NumericKeypadDialog
        open={showKeypad}
        onOpenChange={setShowKeypad}
        value={keypadValue}
        onValueChange={setKeypadValue}
        onConfirm={handleKeypadConfirm}
        title={`${keypadTitle} ${getFieldNumber(activeField)}`}
        confirmText={loginButton}
      />
    </>
  );
}
