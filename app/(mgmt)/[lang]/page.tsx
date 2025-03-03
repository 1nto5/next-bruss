import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Info from './components/welcome-alert';

export default async function Home(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const dict = await getDictionary(lang);
  const infoDescription = (
    <>
      {dict.home.description}
      <a
        href={`mailto:adrian.antosiak@bruss-group.com `}
        className='text-blue-600 hover:text-blue-800'
      >
        adrian.antosiak@bruss-group.com
      </a>
      .
    </>
  );
  return (
    <div className='flex justify-center'>
      <Info title={dict?.home?.title} description={infoDescription} />
    </div>
  );
}
