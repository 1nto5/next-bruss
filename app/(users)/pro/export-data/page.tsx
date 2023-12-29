'use server';

import ExportCard from './components/ExportCard';

export default async function Page() {
  return (
    <main className='m-2 flex justify-center'>
      <ExportCard />
    </main>
  );
}
