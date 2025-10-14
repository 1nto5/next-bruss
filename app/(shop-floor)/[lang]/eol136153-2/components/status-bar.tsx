'use client';

import StatusCard from '@/app/(shop-floor)/[lang]/components/status-card';
import DeleteConfirmDialog from '@/app/(shop-floor)/[lang]/components/delete-confirm-dialog';
import ItemListDialog from '@/app/(shop-floor)/[lang]/components/item-list-dialog';
import type { Locale } from '@/lib/config/i18n';
import { Forklift } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { deleteHydraBatch } from '../actions';
import { useGetArticleStatus } from '../data/get-article-status';
import { useGetPalletBoxes } from '../data/get-pallet-boxes';
import { useOperatorStore } from '../lib/stores';

interface StatusBarProps {
  dict: {
    article136: string;
    article153: string;
    article136Name: string;
    article153Name: string;
    palletFull: string;
    pallet: string;
    boxes: string;
    time: string;
    noScans: string;
    deleteBox: string;
    deleteBoxConfirm: string;
    cancel: string;
    delete: string;
    deletingBox: string;
    boxDeleted: string;
    boxNotFound: string;
    deleteError: string;
  };
  lang: Locale;
}

export default function StatusBar({ dict, lang }: StatusBarProps) {
  const { operator } = useOperatorStore();
  const queryClient = useQueryClient();

  // Get status from React Query for both articles
  const { data: article136Status } = useGetArticleStatus('28067');
  const { data: article153Status } = useGetArticleStatus('28042');

  const [article136DialogOpen, setArticle136DialogOpen] = useState(false);
  const [article153DialogOpen, setArticle153DialogOpen] = useState(false);

  // React Query hooks for pallet boxes - must be called before conditional return
  const {
    data: article136Boxes = [],
    refetch: refetchArticle136Boxes,
    isFetching: isLoadingArticle136Boxes,
  } = useGetPalletBoxes('28067');

  const {
    data: article153Boxes = [],
    refetch: refetchArticle153Boxes,
    isFetching: isLoadingArticle153Boxes,
  } = useGetPalletBoxes('28042');

  // Handle icon clicks to fetch data and open dialog
  const handleArticle136IconClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      await refetchArticle136Boxes();
      setArticle136DialogOpen(true);
    },
    [refetchArticle136Boxes],
  );

  const handleArticle153IconClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      await refetchArticle153Boxes();
      setArticle153DialogOpen(true);
    },
    [refetchArticle153Boxes],
  );

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString(process.env.DATE_TIME_LOCALE!);
  };

  // Handle delete actions
  const handleDeleteBox = async (hydraBatch: string, article: string) => {
    if (!operator) return;

    toast.promise(
      async () => {
        const res = await deleteHydraBatch(hydraBatch, operator.identifier);
        if (res.message === 'deleted') {
          // Refetch pallet boxes manually
          if (article === '28067') {
            await refetchArticle136Boxes();
          } else {
            await refetchArticle153Boxes();
          }

          // Invalidate article status query for counter update
          await queryClient.invalidateQueries({
            queryKey: ['article-status', article],
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
  const article136BoxItems = article136Boxes.map((box) => ({
    id: box.hydra,
    primaryValue: box.hydra,
    secondaryValue: formatTime(box.time),
    ...box,
  }));

  const article153BoxItems = article153Boxes.map((box) => ({
    id: box.hydra,
    primaryValue: box.hydra,
    secondaryValue: formatTime(box.time),
    ...box,
  }));

  return (
    <>
      <div className='grid grid-cols-2 gap-2'>
        <StatusCard
          title={`${dict.article136} - ${dict.article136Name}`}
          icon={Forklift}
          current={article136Status?.boxesOnPallet || 0}
          max={article136Status?.palletSize || 0}
          isFull={article136Status?.isFull || false}
          isLoading={isLoadingArticle136Boxes}
          disabled={(article136Status?.boxesOnPallet || 0) === 0}
          fullLabel={dict.palletFull}
          onViewDetails={handleArticle136IconClick}
        />
        <StatusCard
          title={`${dict.article153} - ${dict.article153Name}`}
          icon={Forklift}
          current={article153Status?.boxesOnPallet || 0}
          max={article153Status?.palletSize || 0}
          isFull={article153Status?.isFull || false}
          isLoading={isLoadingArticle153Boxes}
          disabled={(article153Status?.boxesOnPallet || 0) === 0}
          fullLabel={dict.palletFull}
          onViewDetails={handleArticle153IconClick}
        />
      </div>

      {/* Article 136 Pallet Boxes Dialog */}
      <ItemListDialog
        open={article136DialogOpen}
        onOpenChange={setArticle136DialogOpen}
        title={`${dict.article136} - ${dict.pallet}`}
        description={`${article136Status?.boxesOnPallet || 0} / ${article136Status?.palletSize || 0} ${dict.boxes}`}
        icon={Forklift}
        items={article136BoxItems}
        primaryColumnLabel='HYDRA'
        secondaryColumnLabel={dict.time}
        noItemsMessage={dict.noScans}
        renderDeleteAction={(item) => (
          <DeleteConfirmDialog
            title={dict.deleteBox}
            description={dict.deleteBoxConfirm}
            onConfirm={() => handleDeleteBox(item.id, '28067')}
            labels={{
              cancel: dict.cancel,
              delete: dict.delete,
            }}
          />
        )}
      />

      {/* Article 153 Pallet Boxes Dialog */}
      <ItemListDialog
        open={article153DialogOpen}
        onOpenChange={setArticle153DialogOpen}
        title={`${dict.article153} - ${dict.pallet}`}
        description={`${article153Status?.boxesOnPallet || 0} / ${article153Status?.palletSize || 0} ${dict.boxes}`}
        icon={Forklift}
        items={article153BoxItems}
        primaryColumnLabel='HYDRA'
        secondaryColumnLabel={dict.time}
        noItemsMessage={dict.noScans}
        renderDeleteAction={(item) => (
          <DeleteConfirmDialog
            title={dict.deleteBox}
            description={dict.deleteBoxConfirm}
            onConfirm={() => handleDeleteBox(item.id, '28042')}
            labels={{
              cancel: dict.cancel,
              delete: dict.delete,
            }}
          />
        )}
      />
    </>
  );
}
