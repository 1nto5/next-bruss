'use client';

import { signIn } from 'next-auth/react';
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
import { useToast } from '@/components/ui/use-toast';

type LoginFormState = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { toast } = useToast();

  const router = useRouter();
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formState.email || !formState.password) {
      setErrorMessage('Uzupełnij wszystkie pola!');
      return;
    }

    try {
      setIsPending(true);
      const res = await signIn('credentials', {
        email: formState.email,
        password: formState.password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage('Niepoprawne dane logowania!');
        return;
      } else {
        toast({
          title: `Zalogowano: ${formState.email}!`,
        });
        router.replace('/');
      }
    } catch (error) {
      console.error('User login was unsuccessful.:', error);
      setErrorMessage('Skontaktuj się z IT!');
      return;
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
        <CardDescription className='text-red-700'>
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
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
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button type='button' variant='secondary'>
            <Link href='/auth/register'>Rejestracja </Link>
          </Button>
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
    </Card>
  );
}
