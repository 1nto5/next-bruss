'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';
import { saveDmc, saveHydra, savePallet } from '../actions';
import { useGetBoxStatus } from '../data/get-box-status';
import { useGetPalletStatus } from '../data/get-pallet-status';
import type { Dictionary } from '../lib/dictionary';
import { useOperatorStore, useScanStore, useVolumeStore } from '../lib/stores';

interface ScanPanelProps {
  dict: Dictionary;
}

export default function ScanPanel({ dict }: ScanPanelProps) {
  const { selectedArticle, addScan } = useScanStore();
  const { operator1, operator2, operator3 } = useOperatorStore();
  const { volume } = useVolumeStore();
  
  // Get operators array
  const operators = useMemo(() => 
    [operator1, operator2, operator3]
      .filter(op => op?.identifier)
      .map(op => op!.identifier),
    [operator1, operator2, operator3]
  );
  
  // Get status from React Query
  const { data: boxStatus = { piecesInBox: 0, boxIsFull: false } } = useGetBoxStatus(selectedArticle?.id);
  const { data: palletStatus = { boxesOnPallet: 0, palletIsFull: false } } = useGetPalletStatus(
    selectedArticle?.id,
    selectedArticle?.pallet || false
  );
  
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [playOk] = useSound('/ok.wav', { volume });
  const [playNok] = useSound('/nok.mp3', { volume });

  // Focus on mount and when input changes
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [boxStatus.boxIsFull, palletStatus.palletIsFull]);

  const handleDmcScan = useCallback(async () => {
    if (!inputValue.trim() || !selectedArticle) return;

    const dmcValue = inputValue;
    setInputValue('');

    toast.promise(
      async () => {
        const result = await saveDmc(dmcValue, selectedArticle.id, operators);
        
        if (result.message === 'dmc saved') {
          playOk();
          if (result.dmc) {
            addScan(result.dmc);
          }
          setTimeout(() => inputRef.current?.focus(), 50);
          return dict.scan.messages.dmcSaved;
        } else if (result.message === 'dmc saved smart unknown') {
          playOk();
          if (result.dmc) {
            addScan(result.dmc);
          }
          setTimeout(() => inputRef.current?.focus(), 50);
          return dict.scan.messages.smartUnknown;
        } else {
          playNok();
          // Map error messages
          const errorMessages: Record<string, string> = {
            'dmc exists': dict.scan.messages.dmcExists,
            'dmc not valid': dict.scan.messages.dmcNotValid,
            'article not found': dict.scan.messages.articleNotFound,
            'ford date not valid': dict.scan.messages.fordDateNotValid,
            'bmw date not valid': dict.scan.messages.bmwDateNotValid,
            '40040 nok': dict.scan.messages['40040Nok'],
            'bri pg saving error': dict.scan.messages.briPgError,
            'smart not found': dict.scan.messages.smartNotFound,
            'smart nok': dict.scan.messages.smartNok,
            'smart pattern': dict.scan.messages.smartPattern,
            'smart fetch error': dict.scan.messages.smartFetchError,
          };
          setTimeout(() => {
            setInputValue(dmcValue);
            inputRef.current?.select();
          }, 50);
          throw new Error(errorMessages[result.message] || dict.scan.messages.saveError);
        }
      },
      {
        loading: dict.scan.savingPlaceholder || 'Zapisywanie...',
        success: (msg) => msg,
        error: (err) => err.message,
      }
    );
  }, [inputValue, selectedArticle, operators, playOk, playNok, addScan, dict.scan]);

  const handleHydraScan = useCallback(async () => {
    if (!inputValue.trim() || !selectedArticle) return;

    const hydraValue = inputValue;
    setInputValue('');

    toast.promise(
      async () => {
        const result = await saveHydra(hydraValue, selectedArticle.id, operators);
        
        if (result.message === 'batch saved') {
          playOk();
          setTimeout(() => inputRef.current?.focus(), 50);
          return dict.scan.messages.batchSaved;
        } else {
          playNok();
          // Map error messages
          const errorMessages: Record<string, string> = {
            'batch exists': dict.scan.messages.batchExists,
            'qr not valid': dict.scan.messages.qrNotValid,
            'article not found': dict.scan.messages.articleNotFound,
            'qr wrong article': dict.scan.messages.qrWrongArticle,
            'qr wrong quantity': dict.scan.messages.qrWrongQuantity,
            'box not full': dict.scan.messages.boxNotFull,
          };
          setTimeout(() => {
            setInputValue(hydraValue);
            inputRef.current?.select();
          }, 50);
          throw new Error(errorMessages[result.message] || dict.scan.messages.saveError);
        }
      },
      {
        loading: dict.scan.savingPlaceholder || 'Zapisywanie...',
        success: (msg) => msg,
        error: (err) => err.message,
      }
    );
  }, [inputValue, selectedArticle, operators, playOk, playNok, dict.scan]);

  const handlePalletScan = useCallback(async () => {
    if (!inputValue.trim() || !selectedArticle) return;

    const palletValue = inputValue;
    setInputValue('');

    toast.promise(
      async () => {
        const result = await savePallet(palletValue, selectedArticle.id, operators);
        
        if (result.message === 'batch saved') {
          playOk();
          setTimeout(() => inputRef.current?.focus(), 50);
          return dict.scan.messages.batchSaved;
        } else {
          playNok();
          // Map error messages
          const errorMessages: Record<string, string> = {
            'batch exists': dict.scan.messages.batchExists,
            'qr not valid': dict.scan.messages.qrNotValid,
            'article not found': dict.scan.messages.articleNotFound,
            'qr wrong article': dict.scan.messages.qrWrongArticle,
            'qr wrong quantity': dict.scan.messages.qrWrongQuantity,
            'qr wrong process': dict.scan.messages.qrWrongProcess,
            'pallet not full': dict.scan.messages.palletNotFull,
          };
          setTimeout(() => {
            setInputValue(palletValue);
            inputRef.current?.select();
          }, 50);
          throw new Error(errorMessages[result.message] || dict.scan.messages.saveError);
        }
      },
      {
        loading: dict.scan.savingPlaceholder || 'Zapisywanie...',
        success: (msg) => msg,
        error: (err) => err.message,
      }
    );
  }, [inputValue, selectedArticle, operators, playOk, playNok, dict.scan]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const isPalletWorkplace = selectedArticle?.pallet || false;
      
      // Check box full first - it has priority over pallet
      if (boxStatus.boxIsFull && isPalletWorkplace) {
        handleHydraScan();
      } else if (palletStatus.palletIsFull && isPalletWorkplace) {
        handlePalletScan();
      } else {
        handleDmcScan();
      }
    }
  }, [selectedArticle, boxStatus.boxIsFull, palletStatus.palletIsFull, handleDmcScan, handleHydraScan, handlePalletScan]);

  // Don't render if no article selected
  if (!selectedArticle) return null;

  // Determine which input to show
  const isPalletWorkplace = selectedArticle.pallet || false;
  let inputName = 'dmc';
  let placeholder = dict.scan.dmcPlaceholder;
  
  // Check box full first - it has priority over pallet
  if (boxStatus.boxIsFull && isPalletWorkplace) {
    inputName = 'hydra';
    placeholder = dict.scan.hydraPlaceholder;
  } else if (palletStatus.palletIsFull && isPalletWorkplace) {
    inputName = 'pallet';
    placeholder = dict.scan.palletPlaceholder;
  }

  return (
    <Card>
      <CardHeader>
        <Input
          ref={inputRef}
          type='text'
          name={inputName}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          autoComplete='off'
          className='text-center'
          onFocus={(e) => e.target.select()}
          onKeyDown={handleKeyDown}
        />
      </CardHeader>
    </Card>
  );
}