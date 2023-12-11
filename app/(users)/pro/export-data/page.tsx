'use server';

import Form from './components/Form';

export default async function Page() {
  return (
    <main className='flex justify-center'>
      <Form />
    </main>
  );
}
