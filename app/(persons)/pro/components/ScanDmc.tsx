import { useState, useContext } from 'react';

import { ScanContext } from '@/app/(persons)/pro/lib/ScanContext';
import { saveDmc } from '@/app/(persons)/pro/actions';
import toast from 'react-hot-toast';

type Props = {
  workplace: string;
  article: string;
  operator: string;
  boxSize: number;
};

// Component to scan DMC
export default function ScanDmc(props: Props) {
  const scanContext = useContext(ScanContext);
  const [isPending, setIsPending] = useState(false);

  // Local state for the hydra batch
  const [dmc, setDmc] = useState('');

  // Function to clear input field
  const clearInput = () => {
    setDmc('');
  };

  // Handle key press on input (only interested in 'Enter')
  const handleEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    clearInput();
    toast.loading('Aufnahme...', { id: 'saving' });
    setIsPending(true);
    try {
      if (!props.article || !props.operator) {
        toast.error('Kontaktieren Sie die IT!', { id: 'error' });
        return;
      }

      const result = await saveDmc(
        dmc,
        props.workplace,
        props.article,
        props.operator,
        props.boxSize,
      );

      const status = result?.status;

      // Display toast message based on the result status
      switch (status) {
        case 'saved':
          scanContext?.setScan({ last: dmc });
          toast.success('DMC in Ordnung!', { id: 'success' });
          break;
        case 'exists':
          toast.error('DMC existiert!', { id: 'error' });
          break;
        case 'invalid':
          toast.error('DMC ungültig!', { id: 'error' });
          break;
        case 'wrong date':
          toast.error('Falsches Datum!', { id: 'error' });
          break;
        case 'full box':
          toast.error('Box voll!', { id: 'error' });
          break;
        case 'full pallet':
          toast.error('Palette voll!', { id: 'error' });
          break;
        default:
          toast.error('Melden Sie sich bei der IT!', { id: 'error' });
      }
    } catch (err) {
      toast.error('Melden Sie sich bei der IT!', { id: 'error' });
    } finally {
      toast.dismiss('saving');
      setIsPending(false);
    }
  };

  return (
    <div className='mt-10 flex items-center justify-center'>
      <input
        className='w-1/3 rounded bg-slate-100 p-2 text-center text-4xl shadow-md outline-none focus:border-2 focus:border-solid focus:border-bruss dark:bg-slate-800'
        value={dmc}
        onChange={(event) => setDmc(event.target.value)}
        onKeyDown={handleEnter}
        placeholder='DMC'
        autoFocus
      />
    </div>
  );
}
