'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';
import { save } from '../actions';
import { useScanStore } from '../lib/stores';
import LastScansTable from './last-scans-table';
import { ScanInput } from './scan-input';
import StatusBar from './status-bar';

const initialState: { message: string; dmc?: string; time?: string } = {
  message: '',
  dmc: '',
  time: '',
};

interface ScanPanelProps {
  workplace: string;
  articleConfigId: string;
  operatorPersonalNumber: string;
  boxStatus: { piecesInBox: number; boxIsFull: boolean };
  palletStatus?: { boxesOnPallet: number; palletIsFull: boolean };
}

export default function ScanPanel({
  workplace,
  articleConfigId,
  operatorPersonalNumber,
  boxStatus,
  palletStatus,
}: ScanPanelProps) {
  const [state, formAction] = useActionState(save, initialState);
  const { selectedArticle, addScan, updateBoxStatus, updatePalletStatus } = useScanStore();
  const volume = 0.75;

  const [playOk] = useSound('/ok.wav', { volume });
  const [playNok] = useSound('/nok.mp3', { volume });

  useEffect(() => {
    updateBoxStatus(boxStatus.piecesInBox, boxStatus.boxIsFull);
  }, [boxStatus, updateBoxStatus]);

  useEffect(() => {
    if (palletStatus) {
      updatePalletStatus(palletStatus.boxesOnPallet, palletStatus.palletIsFull);
    }
  }, [palletStatus, updatePalletStatus]);

  useEffect(() => {
    switch (state?.message) {
      case 'dmc saved':
        playOk();
        toast.success('DMC zapisany');
        if (state.dmc) {
          addScan(state.dmc);
        }
        break;
      case 'batch saved':
        playOk();
        toast.success('Batch zapisany');
        break;
      case 'dmc exists':
        playNok();
        toast.error('DMC już istnieje');
        break;
      case 'batch exists':
        playNok();
        toast.error('Batch już istnieje');
        break;
      case 'dmc not valid':
        playNok();
        toast.error('DMC nieprawidłowy');
        break;
      case 'qr not valid':
        playNok();
        toast.error('Kod QR nieprawidłowy');
        break;
      case 'article not found':
      case 'wrong article config id':
        playNok();
        toast.error('Artykuł nie znaleziony');
        break;
      case 'ford date not valid':
        playNok();
        toast.error('Data FORD nieprawidłowa');
        break;
      case 'bmw date not valid':
        playNok();
        toast.error('Data BMW nieprawidłowa');
        break;
      case 'qr wrong article':
        playNok();
        toast.error('Nieprawidłowy artykuł w QR');
        break;
      case 'qr wrong quantity':
        playNok();
        toast.error('Nieprawidłowa ilość w QR');
        break;
      case 'qr wrong process':
        playNok();
        toast.error('Nieprawidłowy proces w QR');
        break;
      case '40040 nok':
        playNok();
        toast.error('Test BRI NOK');
        break;
      case 'bri pg saving error':
        playNok();
        toast.error('Błąd połączenia z BRI');
        break;
      case 'smart not found':
        playNok();
        toast.error('Nie znaleziono w bazie SMART');
        break;
      case 'smart nok':
        playNok();
        toast.error('SMART: Część otrzymała status NOK');
        break;
      case 'smart pattern':
        playNok();
        toast.error('SMART: Część jest wzornikiem');
        break;
      case 'smart fetch error':
        playNok();
        toast.error('Problem połączenia z bazą SMART');
        break;
      case 'dmc saved smart unknown':
        playOk();
        toast.warning('SMART: Część nieprzeprocesowana na wszystkich stacjach');
        if (state.dmc) {
          addScan(state.dmc);
        }
        break;
      default:
        break;
    }
  }, [state, playOk, playNok, addScan]);

  if (!selectedArticle) return null;

  const isPalletWorkplace = selectedArticle.pallet;
  const boxIsFull = boxStatus.boxIsFull;
  const palletIsFull = palletStatus?.palletIsFull;

  return (
    <>
      <StatusBar
        workplace={workplace}
        articleNumber={selectedArticle.articleNumber}
        articleName={selectedArticle.articleName}
        operatorPersonalNumber={operatorPersonalNumber}
        boxStatus={boxStatus}
        palletStatus={palletStatus}
      />

      <Card className='mt-2'>
        <CardHeader>
          <CardTitle>Skanowanie</CardTitle>
          <form action={formAction}>
            <input
              hidden
              type='text'
              id='articleConfigId'
              name='articleConfigId'
              defaultValue={articleConfigId}
            />
            <input
              hidden
              type='text'
              id='operatorPersonalNumber'
              name='operatorPersonalNumber'
              defaultValue={operatorPersonalNumber}
            />
            {!boxIsFull && !palletIsFull && (
              <ScanInput
                name='dmc'
                placeholder='Skanuj DMC...'
                savingPlaceholder='Zapisywanie...'
              />
            )}
            {boxIsFull && !palletIsFull && isPalletWorkplace && (
              <ScanInput
                name='hydra'
                placeholder='Skanuj kod QR HYDRA...'
                savingPlaceholder='Zapisywanie...'
              />
            )}
            {palletIsFull && isPalletWorkplace && (
              <ScanInput
                name='pallet'
                placeholder='Skanuj kod QR palety...'
                savingPlaceholder='Zapisywanie...'
              />
            )}
          </form>
        </CardHeader>
        <Separator className='mb-2' />
        <CardContent className='flex justify-center'>
          <LastScansTable />
        </CardContent>
      </Card>
    </>
  );
}