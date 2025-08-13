'use client';

import { PCard, PCardHeader, PInput, PButton } from '@/app/(pro)/components/ui/wrappers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';
import { saveHydraBatch, savePalletBatch, generatePalletBatch, printPalletLabel } from '../actions';
import type { Dictionary } from '../lib/dictionary';
import { useEOLStore } from '../lib/stores';
import { useVolumeStore } from '@/app/(pro)/components/volume-control';
import type { ArticleStatus } from '../lib/types';
import { Printer, QrCode } from 'lucide-react';

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
  onScanSuccess 
}: ScanPanelProps) {
  const { addScan } = useEOLStore();
  const { volume } = useVolumeStore();
  
  const [inputValue, setInputValue] = useState('');
  const [generatedQr, setGeneratedQr] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
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
          throw new Error(errorMessages[result.status] || dict.scanning.messages.error);
        }
      },
      {
        loading: dict.scanning.scanning || 'Zapisywanie...',
        success: (msg) => msg,
        error: (err) => err.message,
      }
    );

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [inputValue, operator, playOk, playNok, addScan, dict.scanning, onScanSuccess]);

  const handlePalletScan = useCallback(async (article: string) => {
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
            'invalid': dict.pallet.messages.invalid,
            'error': dict.pallet.messages.error,
          };
          throw new Error(errorMessages[result.status] || dict.pallet.messages.error);
        }
      },
      {
        loading: dict.pallet.messages.success || 'Zapisywanie...',
        success: (msg) => msg,
        error: (err) => err.message,
      }
    );

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [inputValue, operator, playOk, playNok, dict.pallet, onScanSuccess]);

  const handleGenerateBatch = useCallback(async (article: string) => {
    try {
      const qr = await generatePalletBatch(article);
      setGeneratedQr(qr);
      setInputValue(qr);
      toast.success(dict.pallet.generateBatch);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (error) {
      console.error('Generate error:', error);
      toast.error('Failed to generate batch');
      playNok();
    }
  }, [dict.pallet.generateBatch, playNok]);

  const handlePrint = useCallback(async (article: string, articleName: string) => {
    setIsPrinting(true);
    try {
      const result = await printPalletLabel('eol136153', article, articleName);
      if (result.success) {
        toast.success('Label printed successfully');
        playOk();
      } else {
        toast.error('Failed to print label');
        playNok();
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Print error');
      playNok();
    } finally {
      setIsPrinting(false);
    }
  }, [playOk, playNok]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
  }, [currentMode, handleHydraScan, handlePalletScan]);

  // Determine placeholder based on mode
  let placeholder = dict.scanning.placeholder;
  let showGenerate = false;
  let showPrint = false;
  let currentArticle = '';
  let currentArticleName = '';

  if (currentMode === 'pallet136' && article136Status) {
    placeholder = dict.pallet.placeholder;
    showGenerate = true;
    showPrint = true;
    currentArticle = '28067';
    currentArticleName = 'M-136-K-1-A';
  } else if (currentMode === 'pallet153' && article153Status) {
    placeholder = dict.pallet.placeholder;
    showGenerate = true;
    showPrint = true;
    currentArticle = '28042';
    currentArticleName = 'M-153-K-C';
  }

  return (
    <>
      <PCard>
        <PCardHeader>
          <div className='flex gap-2'>
            <PInput
              ref={inputRef}
              type='text'
              name='scan'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              autoComplete='off'
              className='text-center text-xl font-semibold'
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
            />
            {showGenerate && (
              <PButton
                onClick={() => handleGenerateBatch(currentArticle)}
                variant='outline'
                size='default'
              >
                <QrCode className='mr-2 h-5 w-5' />
                {dict.pallet.generateBatch}
              </PButton>
            )}
          </div>
        </PCardHeader>
      </PCard>
      {showPrint && (
        <PCard>
          <PCardHeader>
            <PButton
              onClick={() => handlePrint(currentArticle, currentArticleName)}
              variant='default'
              size='lg'
              disabled={isPrinting}
              className='w-full'
            >
              <Printer className='mr-2 h-5 w-5' />
              {isPrinting ? dict.pallet.printing : dict.pallet.print}
            </PButton>
          </PCardHeader>
        </PCard>
      )}
    </>
  );
}