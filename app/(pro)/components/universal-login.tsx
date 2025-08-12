'use client';

import LoginWithKeypad from '@/app/(pro)/components/login-with-keypad';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const loginSchema = z.object({
  identifier1: z.string().min(1, 'Required'),
  identifier2: z.string().optional(),
  identifier3: z.string().optional(),
});

interface UniversalLoginProps {
  dict: {
    title: string;
    operator1Label: string;
    operator2Label: string;
    operator3Label: string;
    personalNumber2Label: string;
    personalNumber3Label: string;
    placeholder: string;
    loginButton: string;
    clearButton: string;
    keypadTitle: string;
    errors: {
      wrongNumber1: string;
      wrongNumber2: string;
      wrongNumber3: string;
      loginError: string;
    };
  };
  loginAction: (data: z.infer<typeof loginSchema>) => Promise<any>;
  onSuccess: (result: any) => void;
}

export default function UniversalLogin({ dict, loginAction, onSuccess }: UniversalLoginProps) {
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
      const res = await loginAction(data);
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
        onSuccess(res);
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
      clearButton={dict.clearButton}
      keypadTitle={dict.keypadTitle}
      isPending={isPending}
    />
  );
}