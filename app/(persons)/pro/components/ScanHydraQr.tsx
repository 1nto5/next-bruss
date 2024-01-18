import { useState, useContext } from 'react';
import { saveHydraBatch } from '@/app/(persons)/pro/actions';
import { ScanContext } from '@/app/(persons)/pro/lib/ScanContext';
import toast from 'react-hot-toast';

type StatusProps = {
  workplace: string;
  article: string;
  operator: string;
  boxSize: number;
};

export default function ScanHydraQr(props: StatusProps) {
  const scanContext = useContext(ScanContext);
  const [isPending, setIsPending] = useState(false);
  const [hydraBatch, setHydraBatch] = useState('');

  const clearHydraBatch = () => {
    setHydraBatch('');
  };

  const handleEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    clearHydraBatch();

    toast.loading('Speichern...', { id: 'saving' });
    setIsPending(true);

    try {
      const result = await saveHydraBatch(
        hydraBatch,
        props.workplace,
        props.article,
        props.operator,
        props.boxSize,
      );

      const status = result?.status;

      switch (status) {
        case 'saved':
          scanContext?.setScan({ last: hydraBatch });
          toast.success('Batch OK!', { id: 'success' });
          break;
        case 'exists':
          toast.error('Batch existiert!', { id: 'error' });
          break;
        case 'invalid':
          toast.error('Ungültiger Batch!', { id: 'error' });
          break;
        case 'wrong article':
          toast.error('Falscher Artikel!', { id: 'error' });
          break;
        case 'wrong quantity':
          toast.error('Falsche Menge!', { id: 'error' });
          break;
        case 'wrong process':
          toast.error('Falscher Prozess!', { id: 'error' });
          break;
        case 'full pallet':
          toast.error('Vollpalette!', { id: 'error' });
          break;
        default:
          toast.error('Wenden Sie sich an die IT!', { id: 'error' });
      }
    } catch (err) {
      toast.error('Wenden Sie sich an die IT!', { id: 'error' });
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
        className='dark-bg-slate-800 w-1/3 rounded bg-slate-100 p-2 text-center text-4xl shadow-md outline-none focus:border-2 focus:border-solid focus:border-bruss'
        value={hydraBatch}
        onChange={(event) => setHydraBatch(event.target.value)}
        onKeyDown={handleEnter}
        placeholder='Hydra QR'
        autoFocus
      />
    </div>
  );
}
