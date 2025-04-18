import { useState, useContext } from 'react';
import { ScanContext } from '../../lib/ScanContext';
import { saveHydraBatch136153 } from '../actions';
import toast from 'react-hot-toast';

type Props = {
  operator: string;
};

// Component to scan Hydra Batch
export default function ScanHydraQr(props: Props) {
  const scanContext = useContext(ScanContext);
  const [isPending, setIsPending] = useState(false);
  const [hydraBatch, setHydraBatch] = useState('');

  const clearHydraBatch = () => {
    setHydraBatch('');
  };

  // Handle key press on input (only interested in 'Enter')
  const handleEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    clearHydraBatch();
    setIsPending(true);
    toast.loading('Zapisywanie...', { id: 'saving' });

    try {
      const result = await saveHydraBatch136153(hydraBatch, props.operator);
      const status = result?.status;

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
      setIsPending(false);
      toast.dismiss('saving');
    }
  };

  return (
    <div className='mt-10 flex items-center justify-center'>
      <input
        className='w-1/3 rounded bg-slate-100 p-2 text-center text-4xl shadow-md outline-hidden focus:border-2 focus:border-solid focus:border-bruss dark:bg-slate-800'
        value={hydraBatch}
        onChange={(event) => setHydraBatch(event.target.value)}
        onKeyDown={handleEnter}
        placeholder='HYDRA QR'
        autoFocus
      />
    </div>
  );
}
