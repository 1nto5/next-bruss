import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function Relaod({ reavalidateHref }: { reavalidateHref: string }) {
  const revalidate = async () => {
    'use server';
    revalidatePath(reavalidateHref);
  };

  return (
    <form action={revalidate}>
      <Button type='submit' variant='outline' size='icon'>
        <RefreshCcw className='h-[1.2rem] w-[1.2rem]' />
      </Button>
    </form>
  );
}
