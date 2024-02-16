import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import Link from 'next/link';

// TODO: change to revalidatePath?

export async function Relaod() {
  return (
    <Link href={''} prefetch={false}>
      <Button type='submit' variant='outline' size='icon'>
        <RefreshCcw className='h-[1.2rem] w-[1.2rem]' />
      </Button>
    </Link>
  );
}
