import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function Reload({
  revalidateHref: revalidateHref,
}: {
  revalidateHref: string;
}) {
  const revalidate = async () => {
    'use server';
    revalidatePath(revalidateHref);
  };

  return (
    <form action={revalidate}>
      <Button type='submit' variant='outline' size='icon'>
        <RefreshCcw className='h-[1.2rem] w-[1.2rem]' />
      </Button>
    </form>
  );
}
