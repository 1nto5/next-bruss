import { useState, useContext } from 'react';
import { saveHydraBatch } from '@/app/pro/actions';
import { ScanContext } from '@/app/pro/lib/ScanContext';
import toast from 'react-hot-toast';

type StatusProps = {
  workplace: string;
  article: string;
  operator: string;
};

// Component to scan Hydra Batch
export default function ScanHydraQr(props: StatusProps) {
  const scanContext = useContext(ScanContext);
  const [isPending, setIsPending] = useState(false);

  // Local state for the hydra batch
  const [hydraBatch, setHydraBatch] = useState('');

  // Function to clear the hydraBatch input field
  const clearHydraBatch = () => {
    setHydraBatch('');
  };

  // Handle key press on input (only interested in 'Enter')
  const handleEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    clearHydraBatch();

    toast.loading('Zapisywanie...', { id: 'saving' });
    setIsPending(true);

    try {
      const result = await saveHydraBatch(
        hydraBatch,
        props.workplace,
        props.article,
        props.operator,
      );

      const status = result?.status;
      // Display toast message based on the result status
      switch (status) {
        case 'saved':
          scanContext?.setScan({ last: hydraBatch });
          toast.success('Batch OK!', { id: 'success' });
          break;
        case 'exists':
          toast.error('Batch istnieje!', { id: 'error' });
          break;
        case 'invalid':
          toast.error('Batch niepoprawny!', { id: 'error' });
          break;
        case 'wrong article':
          toast.error('Błędny artykuł!', { id: 'error' });
          break;
        case 'wrong quantity':
          toast.error('Błędna ilość!', { id: 'error' });
          break;
        case 'wrong process':
          toast.error('Błędny proces!', { id: 'error' });
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

  if (isPending) {
    return null;
  }

  return (
    <div className='mt-10 flex items-center justify-center'>
      <input
        className='w-1/3 rounded bg-slate-100 p-2 text-center text-4xl shadow-md outline-none focus:border-2 focus:border-solid focus:border-bruss dark:bg-slate-800'
        value={hydraBatch}
        onChange={(event) => setHydraBatch(event.target.value)}
        onKeyDown={handleEnter}
        placeholder='Hydra QR'
        autoFocus
      />
    </div>
  );
}
