import { RefreshCcw } from 'lucide-react';

export default function Loading() {
  return (
    <div className='flex justify-center'>
      <RefreshCcw className='mt-8 h-8 w-8 animate-spin' />
    </div>
  );
}
