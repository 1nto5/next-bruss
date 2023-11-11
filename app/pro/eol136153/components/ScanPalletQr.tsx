import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/lib/redux/pro/136-153/hooks';
import {
  toggleIsFull136,
  toggleIsFull153,
  updateLastScan,
} from '@/lib/redux/pro/136-153/workplaceSlice';
import { savePalletBatch } from '../actions';
import { useTransition } from 'react';
import toast from 'react-hot-toast';

type Props = {
  article: string;
};

// Component to scan Pallet Batch
export default function ScanPalletQr({ article }: Props) {
  // Use the operator number from the Redux state
  const operatorPersonalNumber = useAppSelector(
    (state) => state.operator.personalNumber,
  );

  const onPallet136 = useAppSelector((state) => state.workplace.onPallet136);
  const boxSize136 = useAppSelector((state) => state.workplace.boxSize136);
  const quantityOnPallet136 = onPallet136! * boxSize136!;

  const onPallet153 = useAppSelector((state) => state.workplace.onPallet153);
  const boxSize153 = useAppSelector((state) => state.workplace.boxSize153);
  const quantityOnPallet153 = onPallet153! * boxSize153!;

  // React transition state
  const [isPending, startTransition] = useTransition();

  // Local state for the pallet batch
  const [palletQr, setPalletQr] = useState('');

  // Function to clear the hydraBatch input field
  const clearPalletQr = () => {
    setPalletQr('');
  };
  const dispatch = useDispatch();

  // Handle key press on input (only interested in 'Enter')
  const handleEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    clearPalletQr();

    // Start transition (for loading state)
    startTransition(async () => {
      toast.loading('Przetwarzanie...', { id: 'loading' });

      try {
        let status;
        // 136
        if (article === '28067') {
          const result = await savePalletBatch(
            palletQr,
            28067,
            quantityOnPallet136,
            operatorPersonalNumber!,
          );
          status = result?.status;
        }

        // 153
        if (article === '28042') {
          const result = await savePalletBatch(
            palletQr,
            28042,
            quantityOnPallet153,
            operatorPersonalNumber!,
          );
          status = result?.status;
        }

        toast.dismiss();

        // Display toast message based on the result status
        switch (status) {
          case 'saved':
            dispatch(updateLastScan(palletQr));
            // 136
            if (article === '28067') {
              dispatch(toggleIsFull136());
            }
            // 153
            if (article === '28042') {
              dispatch(toggleIsFull153());
            }

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
      }
    });
  };

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
