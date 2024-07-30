import { auth } from '@/auth';
import Container from '@/components/ui/container';
import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { redirect } from 'next/navigation';
// import Info from '../../components/Info';

export const metadata = {
  title: 'Odchylenie (Next BRUSS)',
};

export default async function Layout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  // const dict = await getDictionary(lang);

  const session = await auth();
  if (!session) {
    redirect('/auth');
  }

  return (
    <Container>
      <main>
        <>{children}</>
      </main>
    </Container>
  );
}
