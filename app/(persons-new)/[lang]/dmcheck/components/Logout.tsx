import { Button } from '@/components/ui/button';
import { ReplaceAll } from 'lucide-react';
import Link from 'next/link';

type LogoutAllProps = {
  logoutAllHref: string;
};

export async function LogoutAll({ logoutAllHref }: LogoutAllProps) {
  return (
    <Link href={logoutAllHref}>
      <Button type='submit' variant='outline' size='icon'>
        <ReplaceAll className='h-[1.2rem] w-[1.2rem]' />
      </Button>
    </Link>
  );
}
