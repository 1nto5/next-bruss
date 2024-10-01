import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import Container from '@/components/ui/container';
import AddCapa from './components/add-capa';

export default async function AddCapaPage(
  {
    // params: { lang },
  }: {
    // params: { lang: Locale };
  },
) {
  // const dict = await getDictionary(lang);
  return <AddCapa />;
}
