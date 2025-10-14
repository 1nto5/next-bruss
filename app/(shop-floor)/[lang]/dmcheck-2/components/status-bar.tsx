'use client';

import type { Locale } from '@/lib/config/i18n';
import { Forklift, Package } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { deleteDmcFromBox, deleteHydraFromPallet } from '../actions';
import { useGetBoxScans } from '../data/get-box-scans';
import { useGetBoxStatus } from '../data/get-box-status';
import { useGetPalletBoxes } from '../data/get-pallet-boxes';
import { useGetPalletStatus } from '../data/get-pallet-status';
import type { Dictionary } from '../lib/dict';
import { useOperatorStore, useScanStore } from '../lib/stores';
import StatusCard from '@/app/(shop-floor)/[lang]/components/status-card';
import DeleteConfirmDialog from './delete-confirm-dialog';
import ItemListDialog from './item-list-dialog';

interface StatusBarProps {
  dict: Dictionary['statusBar'];
  lang: Locale;
}

export default function StatusBar({ dict, lang }: StatusBarProps) {
  const { selectedArticle, removeScan } = useScanStore();
  const { operator1, operator2, operator3 } = useOperatorStore();
  const queryClient = useQueryClient();

  // Get operators array
  const operators = [operator1, operator2, operator3]
    .filter((op) => op?.identifier)
    .map((op) => op!.identifier);

  // Get status from React Query
  const { data: boxData = { piecesInBox: 0 } } = useGetBoxStatus(selectedArticle?.id);
  const { data: palletData = { boxesOnPallet: 0 } } = useGetPalletStatus(
    selectedArticle?.id, 
    selectedArticle?.pallet || false
  );

  // Calculate full status locally using selectedArticle from store
  const boxIsFull = boxData.piecesInBox >= (selectedArticle?.piecesPerBox || 0);
  const palletIsFull =
    palletData.boxesOnPallet >= (selectedArticle?.boxesPerPallet || 0);

  const [boxDialogOpen, setBoxDialogOpen] = useState(false);
  const [palletDialogOpen, setPalletDialogOpen] = useState(false);

  // React Query hooks with manual refetch - must be called before conditional return
  const {
    data: boxScans = [],
    refetch: refetchBoxScans,
    isFetching: isLoadingBoxScans,
  } = useGetBoxScans(selectedArticle?.id);

  const {
    data: palletBoxes = [],
    refetch: refetchPalletBoxes,
    isFetching: isLoadingPalletBoxes,
  } = useGetPalletBoxes(selectedArticle?.id);

  // Handle icon clicks to fetch data and open dialog - must be called before conditional return
  const handleBoxIconClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      await refetchBoxScans();
      setBoxDialogOpen(true);
    },
    [refetchBoxScans],
  );

  const handlePalletIconClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      await refetchPalletBoxes();
      setPalletDialogOpen(true);
    },
    [refetchPalletBoxes],
  );

  // Don't render if no article selected
  if (!selectedArticle) return null;

  const { piecesPerBox, boxesPerPallet } = selectedArticle;

  const locale = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'pl-PL';

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString(locale);
  };

  // Handle delete actions
  const handleDeleteDmc = async (dmc: string) => {
    toast.promise(
      async () => {
        const res = await deleteDmcFromBox(dmc, operators);
        if (res.message === 'deleted') {
          // Remove from local store
          removeScan(dmc);
          
          // Refetch box scans manually since it's disabled by default
          await refetchBoxScans();
          
          // Invalidate box status query for counter update
          await queryClient.invalidateQueries({
            queryKey: ['box-status', selectedArticle?.id],
          });
          
          return dict.dmcDeleted;
        } else if (res.message === 'not found') {
          throw new Error(dict.dmcNotFound);
        } else if (res.message === 'invalid parameters') {
          throw new Error('Invalid parameters provided');
        } else if (res.message === 'update failed') {
          throw new Error('Failed to update database');
        } else {
          throw new Error(dict.deleteError);
        }
      },
      {
        loading: dict.deletingDmc,
        success: (msg) => msg,
        error: (err) => err.message || dict.deleteError,
      },
    );
  };

  const handleDeleteBox = async (hydra: string) => {
    toast.promise(
      async () => {
        const res = await deleteHydraFromPallet(hydra, operators);
        if (res.message === 'deleted') {
          // Refetch pallet boxes manually since it's disabled by default
          await refetchPalletBoxes();
          
          // Invalidate pallet status query for counter update
          await queryClient.invalidateQueries({
            queryKey: ['pallet-status', selectedArticle?.id],
          });
          
          return dict.boxDeleted;
        } else if (res.message === 'not found') {
          throw new Error(dict.boxNotFound);
        } else if (res.message === 'invalid parameters') {
          throw new Error('Invalid parameters provided');
        } else if (res.message === 'update failed') {
          throw new Error('Failed to update database');
        } else {
          throw new Error(dict.deleteError);
        }
      },
      {
        loading: dict.deletingBox,
        success: (msg) => msg,
        error: (err) => err.message || dict.deleteError,
      },
    );
  };

  // Transform data for ItemListDialog
  const boxScanItems = boxScans.map((scan) => ({
    id: scan.dmc,
    primaryValue: scan.dmc,
    secondaryValue: formatTime(scan.time),
    ...scan,
  }));

  const palletBoxItems = palletBoxes.map((box) => ({
    id: box.hydra,
    primaryValue: box.hydra,
    secondaryValue: formatTime(box.time),
    ...box,
  }));

  return (
    <>
      <div className={`grid gap-2 ${selectedArticle.pallet ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <StatusCard
          title={dict.box}
          icon={Package}
          current={boxData.piecesInBox}
          max={piecesPerBox}
          isFull={boxIsFull}
          isLoading={isLoadingBoxScans}
          disabled={boxData.piecesInBox === 0}
          fullLabel={dict.full}
          onViewDetails={handleBoxIconClick}
        />

        {selectedArticle.pallet && (
          <StatusCard
            title={dict.pallet}
            icon={Forklift}
            current={palletData.boxesOnPallet}
            max={boxesPerPallet || 0}
            isFull={palletIsFull}
            isLoading={isLoadingPalletBoxes}
            disabled={palletData.boxesOnPallet === 0}
            fullLabel={dict.fullPallet}
            onViewDetails={handlePalletIconClick}
          />
        )}
      </div>

      {/* Box Scans Dialog */}
      <ItemListDialog
        open={boxDialogOpen}
        onOpenChange={setBoxDialogOpen}
        title={dict.box}
        description={`${boxData.piecesInBox} / ${piecesPerBox} ${dict.pieces}`}
        icon={Package}
        items={boxScanItems}
        primaryColumnLabel='DMC'
        secondaryColumnLabel={dict.time}
        noItemsMessage={dict.noScans}
        renderDeleteAction={(item) => (
          <DeleteConfirmDialog
            title={dict.deleteDmc}
            description={dict.deleteDmcConfirm}
            onConfirm={() => handleDeleteDmc(item.id)}
            labels={{
              cancel: dict.cancel,
              delete: dict.delete,
            }}
          />
        )}
      />

      {/* Pallet Scans Dialog */}
      {selectedArticle.pallet && (
        <ItemListDialog
          open={palletDialogOpen}
          onOpenChange={setPalletDialogOpen}
          title={dict.pallet}
          description={`${palletData.boxesOnPallet} / ${boxesPerPallet || 0} ${dict.boxes}`}
          icon={Forklift}
          items={palletBoxItems}
          primaryColumnLabel='HYDRA'
          secondaryColumnLabel={dict.time}
          noItemsMessage={dict.noScans}
          renderDeleteAction={(item) => (
            <DeleteConfirmDialog
              title={dict.deleteBox}
              description={dict.deleteBoxConfirm}
              onConfirm={() => handleDeleteBox(item.id)}
              labels={{
                cancel: dict.cancel,
                delete: dict.delete,
              }}
            />
          )}
        />
      )}
    </>
  );
}