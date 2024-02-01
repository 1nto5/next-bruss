'use client';

import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { redirectToArticle } from '../actions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

const initialState = {
  message: '',
};

// function SubmitButton() {
//   const { pending } = useFormStatus();

//   return (
//     <button type='submit' aria-disabled={pending}>
//       Add
//     </button>
//   );
// }

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
  const [state, formAction] = useFormState(redirectToArticle, initialState);
  const { pending } = useFormStatus();

  return (
    // <form action={formAction}>
    //   <input
    //     hidden
    //     type='text'
    //     defaultValue={articleConfigId}
    //     id='articleConfigId'
    //     name='articleConfigId'
    //     required
    //   />
    //   <p aria-live='polite' className='sr-only' role='status'>
    //     {state?.message}
    //   </p>
    // <Button
    //   type='submit'
    //   aria-disabled={pending}
    //   className='m-4 min-h-24 min-w-48'
    //   variant='outline'
    // >
    //   {articleNumber}
    // </Button>

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
