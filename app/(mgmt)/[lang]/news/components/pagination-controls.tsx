'use client';

import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginationControlsProps {
  data: { pagination: PaginationData };
  lang: string;
  dict: any;
  currentPage: number;
}

export function PaginationControls({ 
  data, 
  lang, 
  dict, 
  currentPage 
}: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    router.push(`/${lang}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  if (data.pagination.totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        {data.pagination.hasPreviousPage && (
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => navigateToPage(currentPage - 1)}
              className="cursor-pointer"
            >
              {(dict.pagination?.previous) || 'Previous'}
            </PaginationPrevious>
          </PaginationItem>
        )}
        
        {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink 
              onClick={() => navigateToPage(page)}
              isActive={page === currentPage}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        {data.pagination.hasNextPage && (
          <PaginationItem>
            <PaginationNext 
              onClick={() => navigateToPage(currentPage + 1)}
              className="cursor-pointer"
            >
              {(dict.pagination?.next) || 'Next'}
            </PaginationNext>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}