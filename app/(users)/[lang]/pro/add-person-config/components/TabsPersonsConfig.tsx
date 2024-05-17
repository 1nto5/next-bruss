import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddPersonConfig from './AddPersonConfig';
import NoAvailable from '@/app/(users)/[lang]/components/NoAvailable';

export default function TabsPersonsConfig({
  dict,
  lang,
}: {
  dict: any;
  lang: string;
}) {
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
        <AddPersonConfig cDict={dict?.personsConfig} lang={lang} />
      </TabsContent>
    </Tabs>
  );
}
