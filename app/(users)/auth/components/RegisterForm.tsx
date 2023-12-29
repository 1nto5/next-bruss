'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Register } from '../actions';
import { useToast } from '@/components/ui/use-toast';

type RegisterFormState = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const { toast } = useToast();
  const [formState, setFormState] = useState<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formState.email || !formState.password || !formState.confirmPassword) {
      setErrorMessage('All fields are necessary!');
      return;
    }

    try {
      setIsPending(true);
      if (
        !formState.email ||
        !formState.password ||
        !formState.confirmPassword
      ) {
        setErrorMessage('Uzupełnij wszystkie pola!');
        return;
      }

      if (!formState.email.endsWith('@bruss-group.com')) {
        setErrorMessage(
          'Użyj służbowy adres email (imie.nazwisko@bruss-group.com)!',
        );
        return;
      }

      if (formState.password !== formState.confirmPassword) {
        setErrorMessage('Hasła nie są zgodne!');
        return;
      }
      const result = await Register(formState.email, formState.password);
      const status = result?.status;
      if (status === 'registered') {
        setFormState({
          email: '',
          password: '',
          confirmPassword: '',
        });
        toast({
          title: `Zarejestrowano: ${formState.email}!`,
        });
        setErrorMessage(null);
        router.push('/auth/login');
      }
      if (status === 'wrong password') {
        setErrorMessage(
          'Hasło musi zawierać 6 znaków, znak specjalny, cyfrę i wielką literę!',
        );
        return;
      }

      if (status === 'exists') {
        setErrorMessage('Konto istnieje!');
        return;
      }
      if (status === 'error') {
        setErrorMessage('Skontaktuj się z IT!');
        return;
      }
    } catch (error) {
      console.error('User registration was unsuccessful.:', error);
      setErrorMessage('Skontaktuj się z IT!');

      return;
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>Rejestracja</CardTitle>
        <CardDescription className='text-red-700'>
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent>
          <div className='grid w-full items-center gap-4'>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formState.email}
                onChange={handleInputChange}
              />
            </div>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='password'>Hasło</Label>
              <Input
                id='password'
                name='password'
                type='password'
                value={formState.password}
                onChange={handleInputChange}
              />
            </div>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='confirmPassword'>Potwierdź hasło</Label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                value={formState.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button type='button' variant='secondary'>
            <Link href='/auth/login'>Logowanie </Link>
          </Button>
          {isPending ? (
            <Button disabled>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Rejestrowanie
            </Button>
          ) : (
            <Button type='submit'>Utwórz konto</Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
