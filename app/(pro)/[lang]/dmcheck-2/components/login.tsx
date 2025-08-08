'use client';

import LoginWithKeypad from '@/app/(pro)/components/login-with-keypad';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { login } from '../actions';
import type { Dictionary } from '../lib/dictionary';
import { useOperatorStore } from '../lib/stores';
import { loginSchema } from '../lib/zod';

interface LoginProps {
  dict: Dictionary['login'];
}

export default function Login({ dict }: LoginProps) {
  const { setOperator1, setOperator2, setOperator3 } = useOperatorStore();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier1: '',
      identifier2: '',
      identifier3: '',
    },
    shouldFocusError: false,
  });

  const handleSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsPending(true);
    try {
      const res = await login(data);
      if (res.error) {
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

  return (
    <LoginWithKeypad
      onSubmit={handleSubmit}
      form={form}
      title={dict.title}
      operator1Label={dict.operator1Label}
      operator2Label={dict.operator2Label}
      operator3Label={dict.operator3Label}
      personalNumber2Label={dict.personalNumber2Label}
      personalNumber3Label={dict.personalNumber3Label}
      placeholder={dict.placeholder}
      loginButton={dict.loginButton}
      clearButton={dict.clearButton || 'Wyczyść'}
      keypadTitle={dict.keypadTitle || 'Wprowadź numer personalny operatora'}
      isPending={isPending}
    />
  );
}