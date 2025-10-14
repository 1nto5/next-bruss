'use client';

import { PrintPalletLabel } from '@/app/(shop-floor)/[lang]/components/print-pallet-label';
import { useVolumeStore } from '@/app/(shop-floor)/[lang]/components/volume-control';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';
import { getPalletQr, saveHydraBatch, savePalletBatch } from '../actions';
import type { Dictionary } from '../lib/dict';
import { useEOLStore } from '../lib/stores';
import type { ArticleStatus } from '../lib/types';

interface ScanPanelProps {
  dict: Dictionary;
  operator: string;
  article136Status: ArticleStatus | null;
  article153Status: ArticleStatus | null;
  currentMode: 'scanning' | 'pallet136' | 'pallet153';
  onScanSuccess: () => void;
}

export default function ScanPanel({
  dict,
  operator,
  article136Status,
  article153Status,
  currentMode,
  onScanSuccess,
}: ScanPanelProps) {
  const { addScan } = useEOLStore();
  const { volume } = useVolumeStore();

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [playOk] = useSound('/ok.wav', { volume });
  const [playNok] = useSound('/nok.mp3', { volume });

  // Focus on mount and mode changes
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [currentMode]);

  const handleHydraScan = useCallback(async () => {
    if (!inputValue.trim()) return;

    const hydraValue = inputValue;
    setInputValue('');

    toast.promise(
      async () => {
        const result = await saveHydraBatch(hydraValue, operator);

        if (result.status === 'saved') {
          playOk();
          if (result.article && result.batch) {
            addScan(result.batch, result.article);
          }
          await onScanSuccess();
          return dict.scanning.messages.saved;
        } else {
          playNok();
          const errorMessages: Record<string, string> = {
            'exists': dict.scanning.messages.exists,
            'invalid': dict.scanning.messages.invalid,
            'wrong article': dict.scanning.messages.wrongArticle,
            'wrong quantity': dict.scanning.messages.wrongQuantity,
            'wrong process': dict.scanning.messages.wrongProcess,
            'full pallet': dict.scanning.messages.fullPallet,
            'error': dict.scanning.messages.error,
          };
          throw new Error(
            errorMessages[result.status] || dict.scanning.messages.error,
          );
        }
      },
      {
        loading: dict.scanning.scanning || 'Saving...',
        success: (msg) => msg,
        error: (err) => err.message,
      },
    );

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [
    inputValue,
    operator,
    playOk,
    playNok,
    addScan,
    dict.scanning,
    onScanSuccess,
  ]);

  const handlePalletScan = useCallback(
    async (article: string) => {
      if (!inputValue.trim()) return;

      const palletValue = inputValue;
      setInputValue('');

      toast.promise(
        async () => {
          const result = await savePalletBatch(palletValue, article, operator);

          if (result.status === 'success') {
            playOk();
            await onScanSuccess();
            return dict.pallet.messages.success;
          } else {
            playNok();
            const errorMessages: Record<string, string> = {
              invalid: dict.pallet.messages.invalid,
              error: dict.pallet.messages.error,
            };
            throw new Error(
              errorMessages[result.status] || dict.pallet.messages.error,
            );
          }
        },
        {
          loading: dict.pallet.messages.success || 'Saving...',
          success: (msg) => msg,
          error: (err) => err.message,
        },
      );

      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [inputValue, operator, playOk, playNok, dict.pallet, onScanSuccess],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        if (currentMode === 'scanning') {
          handleHydraScan();
        } else if (currentMode === 'pallet136') {
          handlePalletScan('28067');
        } else if (currentMode === 'pallet153') {
          handlePalletScan('28042');
        }
      }
    },
    [currentMode, handleHydraScan, handlePalletScan],
  );

  // Determine placeholder and article info based on mode
  let placeholder = dict.scanning.placeholder;
  let showPrint = false;
  let currentArticle = '';
  let currentArticleName = '';
  let totalQuantity = 0;

  if (currentMode === 'pallet136' && article136Status) {
    placeholder = dict.pallet.placeholder;
    showPrint = true;
    currentArticle = '28067';
    currentArticleName = 'M-136-K-1-A';
    totalQuantity = article136Status.boxesOnPallet * 12; // 12 pieces per box
  } else if (currentMode === 'pallet153' && article153Status) {
    placeholder = dict.pallet.placeholder;
    showPrint = true;
    currentArticle = '28042';
    currentArticleName = 'M-153-K-C';
    totalQuantity = article153Status.boxesOnPallet * 10; // 10 pieces per box
  }

  return (
    <>
      <Card>
        <CardHeader>
          <Input
            ref={inputRef}
            type='text'
            name='scan'
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
      {showPrint && (
        <PrintPalletLabel
          article={currentArticle}
          articleName={currentArticleName}
          totalQuantity={totalQuantity}
          buttonText={dict.pallet.print}
          loadingText={dict.pallet.printing}
          successText={dict.pallet.messages.printSuccess}
          errorText={dict.pallet.messages.printError}
          getPalletQrFn={() => getPalletQr(currentArticle)}
        />
      )}
    </>
  );
}
