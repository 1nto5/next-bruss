import Info from './components/Info';

export default async function Home() {
  const infoDescription = (
    <>
      Die Website und die Anwendungen werden derzeit überarbeitet. Bitte melden
      Sie alle Fehler an{' '}
      <a
        href={`mailto:adrian.antosiak@bruss-group.com?subject=Next BRUSS BRI: error`}
        className='text-blue-600 hover:text-blue-800'
      >
        support@bruss-group.com
      </a>
      .
    </>
  );
  return (
    <main className='m-2 flex justify-center'>
      <Info title='Hallo!' description={infoDescription} />
    </main>
  );
}
