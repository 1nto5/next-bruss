import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditArticleConfig from './EditArticleConfig';
// import LoginForm from './LoginForm';
// import RegisterForm from './RegisterForm';

export default function Auth() {
  return (
    <Tabs defaultValue='edit' className='w-[700px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='edit'>Edytuj</TabsTrigger>
        <TabsTrigger value='add'>Dodaj</TabsTrigger>
      </TabsList>
      <TabsContent value='edit'>
        <EditArticleConfig />
      </TabsContent>
      <TabsContent value='add'>{/* <LoginForm /> */}</TabsContent>
    </Tabs>
  );
}
