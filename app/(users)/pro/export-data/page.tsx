'use server';

import Form from './components/Form';

export default async function Page() {
  return (
    <main className='m-2 flex justify-center'>
      <Form />
    </main>
  );
}
