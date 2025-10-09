'use client';

import { useVolumeStore } from '@/app/(shop-floor)/[lang]/components/volume-control';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSound from 'use-sound';
import { saveDmc, saveDmcRework, saveHydra, savePallet } from '../actions';
import { useGetBoxStatus } from '../data/get-box-status';
import { useGetPalletStatus } from '../data/get-pallet-status';
import type { Dictionary } from '../lib/dict';
import { useOperatorStore, useScanStore } from '../lib/stores';
import { PrintPalletLabel } from './print-pallet-label';
import DmcPartVerifyDialog from './dmc-part-verify-dialog';

interface ScanPanelProps {
  dict: Dictionary;
}

export default function ScanPanel({ dict }: ScanPanelProps) {
  const { selectedArticle, addScan, isRework, setIsRework } = useScanStore();
  const { operator1, operator2, operator3 } = useOperatorStore();
  const { volume } = useVolumeStore();

  // Local state for DMC part verification
  const [pendingDmcVerification, setPendingDmcVerification] = useState<string | null>(null);

  // Get operators array
  const operators = useMemo(
    () =>
      [operator1, operator2, operator3]
        .filter((op) => op?.identifier)
        .map((op) => op!.identifier),
    [operator1, operator2, operator3],
  );

  // Get status from React Query with refetch functions
  const {
    data: boxStatus = { piecesInBox: 0, boxIsFull: false },
    refetch: refetchBoxStatus,
  } = useGetBoxStatus(selectedArticle?.id);
  const {
    data: palletStatus = { boxesOnPallet: 0, palletIsFull: false },
    refetch: refetchPalletStatus,
  } = useGetPalletStatus(selectedArticle?.id, selectedArticle?.pallet || false);

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [playOk] = useSound('/ok.wav', { volume });
  const [playNok] = useSound('/nok.mp3', { volume });

  // Focus on mount and when input changes
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [boxStatus.boxIsFull, palletStatus.palletIsFull]);

  const handleDmcScan = useCallback(async (dmcToProcess?: string) => {
    const dmcValue = dmcToProcess || inputValue;
    if (!dmcValue.trim() || !selectedArticle) return;

    // Check if we need DMC part verification on first scan in box

    if (
      !dmcToProcess &&
      selectedArticle.requireDmcPartVerification &&
      boxStatus.piecesInBox === 0
    ) {
      setPendingDmcVerification(dmcValue);
      setInputValue('');
      return;
    }

    if (!dmcToProcess) {
      setInputValue('');
    }

    toast.dismiss();
    toast.promise(
      async () => {
        const result = await saveDmc(dmcValue, selectedArticle.id, operators);

        if (result.message === 'dmc saved') {
          playOk();
          if (result.dmc) {
            addScan(result.dmc);
          }
          // Refetch box status to update piece count
          await refetchBoxStatus();
          setTimeout(() => inputRef.current?.focus(), 50);
          return dict.scan.messages.dmcSaved;
        } else if (result.message === 'dmc saved smart unknown') {
          playOk();
          if (result.dmc) {
            addScan(result.dmc);
          }
          // Refetch box status to update piece count
          await refetchBoxStatus();
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
          // Clear the input value on error
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
          throw new Error(
            errorMessages[result.message] || dict.scan.messages.saveError,
          );
        }
      },
      {
        loading: dict.scan.savingPlaceholder || 'Saving...',
        success: (msg) => msg,
        error: (err) => err.message,
      },
    );
  }, [
    inputValue,
    selectedArticle,
    operators,
    playOk,
    playNok,
    addScan,
    dict.scan,
    refetchBoxStatus,
    boxStatus.piecesInBox,
  ]);

  const handleDmcReworkScan = useCallback(async () => {
    if (!inputValue.trim() || !selectedArticle) return;

    const dmcValue = inputValue;
    setInputValue('');

    toast.dismiss();
    toast.promise(
      async () => {
        const result = await saveDmcRework(dmcValue, selectedArticle.id, operators);

        if (result.message === 'rework dmc saved') {
          playOk();
          if (result.dmc) {
            addScan(result.dmc);
          }
          // Auto-disable rework mode after successful scan
          setIsRework(false);
          // Refetch box status to update piece count
          await refetchBoxStatus();
          setTimeout(() => inputRef.current?.focus(), 50);
          return dict.scan.messages.reworkDmcSaved;
        } else {
          playNok();
          // Map error messages
          const errorMessages: Record<string, string> = {
            'rework not possible': dict.scan.messages.reworkNotPossible,
            'dmc not valid': dict.scan.messages.dmcNotValid,
            'article not found': dict.scan.messages.articleNotFound,
            'smart not found': dict.scan.messages.smartNotFound,
            'smart nok': dict.scan.messages.smartNok,
            'smart pattern': dict.scan.messages.smartPattern,
            'smart fetch error': dict.scan.messages.smartFetchError,
          };
          // Clear the input value on error
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
          throw new Error(
            errorMessages[result.message] || dict.scan.messages.saveError,
          );
        }
      },
      {
        loading: dict.scan.savingPlaceholder || 'Saving...',
        success: (msg) => msg,
        error: (err) => err.message,
      },
    );
  }, [
    inputValue,
    selectedArticle,
    operators,
    playOk,
    playNok,
    addScan,
    dict.scan,
    refetchBoxStatus,
  ]);

  const handleHydraScan = useCallback(async () => {
    if (!inputValue.trim() || !selectedArticle) return;

    const hydraValue = inputValue;
    setInputValue('');

    toast.dismiss();
    toast.promise(
      async () => {
        const result = await saveHydra(
          hydraValue,
          selectedArticle.id,
          operators,
        );

        if (result.message === 'batch saved') {
          playOk();
          // Refetch box and pallet status to update UI
          await refetchBoxStatus();
          await refetchPalletStatus();
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
          // Clear the input value on error
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
          throw new Error(
            errorMessages[result.message] || dict.scan.messages.saveError,
          );
        }
      },
      {
        loading: dict.scan.savingPlaceholder || 'Saving...',
        success: (msg) => msg,
        error: (err) => err.message,
      },
    );
  }, [
    inputValue,
    selectedArticle,
    operators,
    playOk,
    playNok,
    dict.scan,
    refetchBoxStatus,
    refetchPalletStatus,
  ]);

  const handlePalletScan = useCallback(async () => {
    if (!inputValue.trim() || !selectedArticle) return;

    const palletValue = inputValue;
    setInputValue('');

    toast.dismiss();
    toast.promise(
      async () => {
        const result = await savePallet(
          palletValue,
          selectedArticle.id,
          operators,
        );

        if (result.message === 'batch saved') {
          playOk();
          // Refetch both box and pallet status to reset UI
          await refetchBoxStatus();
          await refetchPalletStatus();
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
          // Clear the input value on error
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
          throw new Error(
            errorMessages[result.message] || dict.scan.messages.saveError,
          );
        }
      },
      {
        loading: dict.scan.savingPlaceholder || 'Saving...',
        success: (msg) => msg,
        error: (err) => err.message,
      },
    );
  }, [
    inputValue,
    selectedArticle,
    operators,
    playOk,
    playNok,
    dict.scan,
    refetchBoxStatus,
    refetchPalletStatus,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const isPalletWorkplace = selectedArticle?.pallet || false;

        // Check box full first - it has priority over pallet
        if (boxStatus.boxIsFull) {
          handleHydraScan();
        } else if (palletStatus.palletIsFull && isPalletWorkplace) {
          handlePalletScan();
        } else {
          isRework ? handleDmcReworkScan() : handleDmcScan();
        }
      }
    },
    [
      selectedArticle,
      boxStatus.boxIsFull,
      palletStatus.palletIsFull,
      isRework,
      handleDmcScan,
      handleDmcReworkScan,
      handleHydraScan,
      handlePalletScan,
    ],
  );

  const handleDmcVerifyConfirm = useCallback(() => {
    if (pendingDmcVerification) {
      handleDmcScan(pendingDmcVerification);
      setPendingDmcVerification(null);
    }
  }, [pendingDmcVerification, handleDmcScan]);

  const handleDmcVerifyCancel = useCallback(() => {
    setPendingDmcVerification(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleDmcVerifyReject = useCallback(() => {
    // This is called when operator confirms they will report to supervisor
    setPendingDmcVerification(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Don't render if no article selected
  if (!selectedArticle) return null;

  // Determine which input to show
  const isPalletWorkplace = selectedArticle.pallet || false;
  let inputName = 'dmc';
  let placeholder = dict.scan.dmcPlaceholder;

  // Check box full first - it has priority over pallet
  if (boxStatus.boxIsFull) {
    inputName = 'hydra';
    placeholder = dict.scan.hydraPlaceholder;
  } else if (palletStatus.palletIsFull && isPalletWorkplace) {
    inputName = 'pallet';
    placeholder = dict.scan.palletPlaceholder;
  } else if (isRework) {
    placeholder = dict.scan.reworkDmcPlaceholder;
  }

  return (
    <>
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
      {/* Show print button when pallet is full */}
      {palletStatus.palletIsFull && isPalletWorkplace && (
        <PrintPalletLabel dict={dict.scan} />
      )}

      {/* DMC Part Verification Dialog - only render if feature is enabled */}
      {selectedArticle?.requireDmcPartVerification && (
        <DmcPartVerifyDialog
          open={pendingDmcVerification !== null}
          onOpenChange={(open) => !open && setPendingDmcVerification(null)}
          scannedDmc={pendingDmcVerification || ''}
          workplace={selectedArticle.workplace}
          dmcFirstValidation={selectedArticle.dmcFirstValidation}
          dmcSecondValidation={selectedArticle.dmcSecondValidation}
          onConfirm={handleDmcVerifyConfirm}
          onCancel={handleDmcVerifyCancel}
          onReject={handleDmcVerifyReject}
          dict={dict}
        />
      )}
    </>
  );
}
