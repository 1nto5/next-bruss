import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import Container from '@/components/ui/container';
import Header from './components/Header';
import Login from './components/Login';

export default async function ArticleSelectionPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  return (
    <>
      <Header />
      <Container>
        <main className='flex justify-center'>
          <Login />
        </main>
      </Container>
    </>
  );
}
