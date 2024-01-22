'use server';

import Reset from '../../components/Reset';

export default async function Page({ params }: { params: { token: string } }) {
  return (
    <main className='m-2 flex justify-center'>
      <Reset token={params.token} />
    </main>
  );
}
