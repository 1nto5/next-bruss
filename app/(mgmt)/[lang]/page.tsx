import FormContainer from '@/components/ui/form-container';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Info from './components/info';

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
        href={`mailto:adrian.antosiakt@bruss-group.com?subject=Next BRUSS: `}
        className='text-blue-600 hover:text-blue-800'
      >
        adrian.antosiak@bruss-group.com
      </a>
      .
    </>
  );
  return (
    <FormContainer>
      <Info title={dict?.home?.title} description={infoDescription} />
    </FormContainer>
  );
}
