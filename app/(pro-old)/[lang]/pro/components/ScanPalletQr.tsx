import { useState, useContext } from 'react';
import { savePalletBatch } from '../actions';
import toast from 'react-hot-toast';
import { ScanContext } from '../lib/ScanContext';

type Props = {
  workplace: string;
  article: string;
  operator: string;
};

// Component to scan Pallet Batch
export default function ScanPalletQr(props: Props) {
  const scanContext = useContext(ScanContext);
  const [isPending, setIsPending] = useState(false);
  const [palletQr, setPalletQr] = useState('');

  const clearPalletQr = () => {
    setPalletQr('');
  };
  const handleEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    clearPalletQr();
    setIsPending(true);
    toast.loading('Zapisywanie...', { id: 'saving' });

    try {
      const result = await savePalletBatch(
        palletQr,
        props.workplace,
        props.article,
        props.operator,
      );
      const status = result?.status;

      switch (status) {
        case 'saved':
          scanContext?.setScan(() => ({
            last: palletQr,
          }));
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
        value={palletQr}
        onChange={(event) => setPalletQr(event.target.value)}
        onKeyDown={handleEnter}
        placeholder='Paleta QR'
        autoFocus
      />
    </div>
  );
}
