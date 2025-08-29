'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { refreshNews } from '../actions';

interface RefreshButtonProps {
  dict: any;
}

export function RefreshButton({ dict }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshNews();
      if (result.success) {
        toast.success(dict.news.messages[result.success] || result.success);
      } else if (result.error) {
        toast.error(result.error === 'unauthorized' ? dict.news.messages.unauthorized : dict.news.messages[result.error] || result.error);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error(dict.news.messages.refreshError || 'Wystąpił błąd podczas odświeżania');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      variant='outline' 
      className='w-full sm:w-auto'
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span>{dict.news.refresh || 'Odśwież'}</span>
    </Button>
  );
}