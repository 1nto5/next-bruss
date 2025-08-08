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
import { useForm, UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import NumericKeypadDialog from './numeric-keypad-dialog';

// Generic login schema that can be customized
const createLoginSchema = (
  requireOperator2: boolean,
  requireOperator3: boolean,
) => {
  return z.object({
    identifier1: z.string().min(1, 'Required'),
    identifier2: requireOperator2
      ? z.string().min(1, 'Required')
      : z.string().optional(),
    identifier3: requireOperator3
      ? z.string().min(1, 'Required')
      : z.string().optional(),
  });
};

export type LoginFormData = {
  identifier1: string;
  identifier2?: string;
  identifier3?: string;
};

export interface LoginWithKeypadProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onError?: (
    field: 'identifier1' | 'identifier2' | 'identifier3',
    message: string,
  ) => void;
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
  isPending?: boolean;
  form?: UseFormReturn<LoginFormData>;
}

export default function LoginWithKeypad({
  onSubmit,
  onError,
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
  isPending = false,
  form: externalForm,
}: LoginWithKeypadProps) {
  const [personalNumber2Form, setPersonalNumber2Form] = useState(false);
  const [personalNumber3Form, setPersonalNumber3Form] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeField, setActiveField] = useState<string>('');
  const [keypadValue, setKeypadValue] = useState('');

  const internalForm = useForm<LoginFormData>({
    resolver: zodResolver(
      createLoginSchema(personalNumber2Form, personalNumber3Form),
    ),
    defaultValues: {
      identifier1: '',
      identifier2: '',
      identifier3: '',
    },
    shouldFocusError: false,
  });

  const form = externalForm || internalForm;

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
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Login error:', error);
    }
  };

  const getFieldNumber = (field: string) => {
    const match = field.match(/\d+$/);
    return match ? match[0] : '';
  };

  return (
    <>
      <Card className='w-full max-w-none'>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <CardContent className='grid w-full items-center gap-4'>
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
                        className='cursor-pointer text-center'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className='flex flex-row items-center justify-between'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>{operator2Label}</FormLabel>
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
                          className='cursor-pointer text-center'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormItem className='flex flex-row items-center justify-between'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>{operator3Label}</FormLabel>
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
                          className='cursor-pointer text-center'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>

            <CardFooter>
              <div className='flex w-full gap-2'>
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
