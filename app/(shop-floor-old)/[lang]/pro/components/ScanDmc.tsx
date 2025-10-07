import { useState, useContext } from 'react';

import { ScanContext } from '@/app/(shop-floor-old)/[lang]/pro/lib/ScanContext';
import { saveDmc } from '@/app/(shop-floor-old)/[lang]/pro/actions';
import toast from 'react-hot-toast';

type Props = {
  workplace: string;
  article: string;
  operator: string;
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
    toast.loading('Zapisywanie...', { id: 'saving' });
    setIsPending(true);
    try {
      if (!props.article || !props.operator) {
        toast.error('Skontaktuj się z IT!', { id: 'error' });
        return;
      }

      const result = await saveDmc(
        dmc,
        props.workplace,
        props.article,
        props.operator,
      );

      const status = result?.status;

      // Display toast message based on the result status
      switch (status) {
        case 'saved':
          scanContext?.setScan({ last: dmc });
          toast.success('DMC OK!', { id: 'success' });
          break;
        case 'exists':
          toast.error('DMC istnieje!', { id: 'error' });
          break;
        case 'invalid':
          toast.error('DMC niepoprawny!', { id: 'error' });
          break;
        case 'wrong date':
          toast.error('Data niepoprawna!', { id: 'error' });
          break;
        case 'full box':
          toast.error('Pełny box!', { id: 'error' });
          break;
        case 'full pallet':
          toast.error('Pełna paleta!', { id: 'error' });
          break;
        default:
          toast.error('Zgłoś się do IT!', { id: 'error' });
      }
    } catch (err) {
      toast.error('Zgłoś się do IT!', { id: 'error' });
    } finally {
      toast.dismiss('saving');
      setIsPending(false);
    }
  };

  return (
    <div className='mt-10 flex items-center justify-center'>
      <input
        className='w-1/3 rounded bg-slate-100 p-2 text-center text-4xl shadow-md outline-hidden focus:border-2 focus:border-solid focus:border-bruss dark:bg-slate-800'
        value={dmc}
        onChange={(event) => setDmc(event.target.value)}
        onKeyDown={handleEnter}
        placeholder='DMC'
        autoFocus
      />
    </div>
  );
}
