import Info from './components/Info';

export default async function Home() {
  const infoDescription = (
    <>
      Strona oraz aplikacje są w trakcie budowy. Proszę o zgłaszanie napotkanych
      błędów na{' '}
      <a
        href={`mailto:support@bruss-group.com?subject=Next BRUSS: zgłoszenie błędu`}
        className='text-blue-600 hover:text-blue-800'
      >
        support@bruss-group.com
      </a>
      .
    </>
  );
  return (
    <main className='m-2 flex justify-center'>
      <Info title='Cześć!' description={infoDescription} />
    </main>
  );
}
