import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function Auth() {
  return (
    <Tabs defaultValue='login' className='w-[400px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='login'>Logowanie</TabsTrigger>
        <TabsTrigger value='register'>Rejestracja</TabsTrigger>
      </TabsList>
      <TabsContent value='login'>
        <LoginForm />
      </TabsContent>
      <TabsContent value='register'>
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
}
