'use client';

import LoginWithKeypad from '@/app/(pro)/components/login-with-keypad';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { login } from '../actions';
import type { Dictionary } from '../lib/dictionary';
import { usePersonalNumberStore } from '../lib/stores';
import { loginSchema } from '../lib/zod';

interface LoginProps {
  dict: Dictionary;
}

export default function Login({ dict }: LoginProps) {
  const { setOperator1, setOperator2, setOperator3 } = usePersonalNumberStore();
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
              message: dict.login.errors.wrongNumber1,
            });
            break;
          case 'wrong number 2':
            form.setError('identifier2', {
              type: 'manual',
              message: dict.login.errors.wrongNumber2,
            });
            break;
          case 'wrong number 3':
            form.setError('identifier3', {
              type: 'manual',
              message: dict.login.errors.wrongNumber3,
            });
            break;
          default:
            toast.error(dict.login.errors.loginError);
        }
      } else if (res.success) {
        setOperator1(res.operator1 || null);
        setOperator2(res.operator2 || null);
        setOperator3(res.operator3 || null);
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error(dict.login.errors.loginError);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <LoginWithKeypad
      onSubmit={handleSubmit}
      form={form}
      title={dict.login.title}
      operator1Label={dict.login.operator1Label}
      operator2Label={dict.login.operator2Label}
      operator3Label={dict.login.operator3Label}
      personalNumber2Label={dict.login.personalNumber2Label}
      personalNumber3Label={dict.login.personalNumber3Label}
      placeholder={dict.login.placeholder}
      loginButton={dict.login.loginButton}
      clearButton={dict.login.clearButton}
      keypadTitle={dict.login.keypadTitle}
      isPending={isPending}
    />
  );
}