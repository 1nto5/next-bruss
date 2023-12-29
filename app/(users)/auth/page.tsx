'use server';

import Auth from './components/Auth';

export default async function Page() {
  return (
    <main className='m-2 flex justify-center'>
      <Auth />
    </main>
  );
}
