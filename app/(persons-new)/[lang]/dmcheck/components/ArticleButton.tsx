'use client';

import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ArticleButtonProps = {
  workplaceName: string;
  articleConfigId: string;
  articleNumber: string;
  articleName: string;
};

export function ArticleButton({
  workplaceName,
  articleConfigId,
  articleName,
  articleNumber,
}: ArticleButtonProps) {
  return (
    <Link
      href={{
        pathname: `${workplaceName}/${articleConfigId}`,
      }}
    >
      <Button className='m-4 min-h-24 min-w-48' variant='outline'>
        {articleNumber}
      </Button>
    </Link>
    // </form>
  );
}
