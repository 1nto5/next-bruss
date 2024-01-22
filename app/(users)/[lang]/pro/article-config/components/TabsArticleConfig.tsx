import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditArticleConfig from './EditArticleConfig';
import AddArticleConfig from './AddArticleConfig';
// import LoginForm from './LoginForm';
// import RegisterForm from './RegisterForm';

export default function TabsArticleConfig({ dict }: any) {
  return (
    <Tabs defaultValue='edit' className='w-[450px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='edit'>
          {dict?.articleConfig?.tabs?.edit}
        </TabsTrigger>
        <TabsTrigger value='add'>{dict?.articleConfig?.tabs?.add}</TabsTrigger>
      </TabsList>
      <TabsContent value='edit'>{/* <EditArticleConfig /> */}</TabsContent>
      <TabsContent value='add'>
        <AddArticleConfig dict={dict} />
      </TabsContent>
    </Tabs>
  );
}
