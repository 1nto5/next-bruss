import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function Auth() {
  return (
    <Tabs defaultValue='login' className='w-[400px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='login'>Logging</TabsTrigger>
        <TabsTrigger value='register'>Registrierung</TabsTrigger>
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
