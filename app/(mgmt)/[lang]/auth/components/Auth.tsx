import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './login-form';
import RegisterForm from './register-form';

export default function Auth({ cDict }: { cDict: any }) {
  return (
    <Tabs defaultValue='login' className='w-[400px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='login'>{cDict.loginTab}</TabsTrigger>
        <TabsTrigger value='register'>{cDict.registerTab}</TabsTrigger>
      </TabsList>
      <TabsContent value='login'>
        <LoginForm cDict={cDict} />
      </TabsContent>
      <TabsContent value='register'>
        <RegisterForm cDict={cDict} />
      </TabsContent>
    </Tabs>
  );
}
