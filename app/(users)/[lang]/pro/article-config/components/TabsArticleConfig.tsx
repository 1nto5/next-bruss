import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddArticleConfig from './AddArticleConfig';
import NoAvailable from '@/app/(users)/[lang]/components/NoAvailable';

//TODO: edit article config

export default function TabsArticleConfig({ dict }: any) {
  return (
    <Tabs defaultValue='add' className='w-[450px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='add'>{dict?.articleConfig?.tabs?.add}</TabsTrigger>
        <TabsTrigger value='edit'>
          {dict?.articleConfig?.tabs?.edit}
        </TabsTrigger>
      </TabsList>
      <TabsContent value='edit'>
        <NoAvailable />
      </TabsContent>
      <TabsContent value='add'>
        <AddArticleConfig dict={dict} />
      </TabsContent>
    </Tabs>
  );
}
