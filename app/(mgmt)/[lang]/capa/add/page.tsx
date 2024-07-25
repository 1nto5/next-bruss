import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import AddCapa from './components/AddCapa';
import Container from '@/components/ui/container';

export default async function AddCapaPage(
  {
    // params: { lang },
  }: {
    // params: { lang: Locale };
  },
) {
  // const dict = await getDictionary(lang);
  return (
    <Container>
      <main className='flex justify-center'>
        <AddCapa />
      </main>
    </Container>
  );
}
