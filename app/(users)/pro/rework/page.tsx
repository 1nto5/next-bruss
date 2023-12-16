'use server';

import ReworkCard from './components/ReworkCard';

export default async function Page() {
  return (
    <main className='m-2 flex justify-center'>
      <ReworkCard />
    </main>
  );
}
