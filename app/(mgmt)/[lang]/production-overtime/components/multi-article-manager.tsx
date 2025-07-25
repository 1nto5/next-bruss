'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ArticleSearch, ArticleSearchRef } from './article-search';

type ArticleQuantity = {
  articleNumber: string;
  quantity: number;
};

type ArticleWithDetails = ArticleQuantity & {
  name?: string;
  unit?: string;
};

interface MultiArticleManagerProps {
  value: ArticleQuantity[];
  onChange: (articles: ArticleQuantity[]) => void;
  label?: string;
  placeholder?: string;
  initialValues?: ArticleQuantity[];
}

export function MultiArticleManager({
  value,
  onChange,
  label = 'Planowana produkcja',
  placeholder = 'Wybierz artykuł',
  initialValues = [],
}: MultiArticleManagerProps) {
  const [newArticle, setNewArticle] = useState<{
    articleNumber: string;
    quantity: string;
  }>({
    articleNumber: '',
    quantity: '',
  });

  const [initialized, setInitialized] = useState(false);
  const [articlesWithDetails, setArticlesWithDetails] = useState<
    ArticleWithDetails[]
  >([]);
  const articleSearchRef = useRef<ArticleSearchRef>(null);

  // Initialize with initialValues only once
  useEffect(() => {
    if (!initialized && value.length === 0 && initialValues.length > 0) {
      onChange([...initialValues]);
      setInitialized(true);
    }
  }, [initialized, value.length, initialValues, onChange]);

  // Fetch article details when value changes
  useEffect(() => {
    const fetchArticleDetails = async () => {
      const articlePromises = value.map(async (article) => {
        try {
          const response = await fetch(
            `/api/inventory-articles?query=${encodeURIComponent(article.articleNumber)}`,
          );
          const data = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            const foundArticle = data.find(
              (item) => item.number === article.articleNumber,
            );
            if (foundArticle) {
              return {
                ...article,
                name: foundArticle.name,
                unit: foundArticle.unit,
              };
            }
          }
          return {
            ...article,
            name: 'Nieznany artykuł',
            unit: '',
          };
        } catch (error) {
          console.error('Error fetching article details:', error);
          return {
            ...article,
            name: 'Błąd pobierania',
            unit: '',
          };
        }
      });

      const detailedArticles = await Promise.all(articlePromises);
      setArticlesWithDetails(detailedArticles);
    };

    if (value.length > 0) {
      fetchArticleDetails();
    } else {
      setArticlesWithDetails([]);
    }
  }, [value]);

  const addArticle = () => {
    if (newArticle.articleNumber && newArticle.quantity) {
      const quantity = parseInt(newArticle.quantity);
      if (quantity > 0) {
        // Check if article already exists
        const existingIndex = value.findIndex(
          (item) => item.articleNumber === newArticle.articleNumber,
        );

        if (existingIndex >= 0) {
          // Update existing article quantity
          const updatedArticles = [...value];
          updatedArticles[existingIndex].quantity = quantity;
          onChange(updatedArticles);
        } else {
          // Add new article
          onChange([
            ...value,
            { articleNumber: newArticle.articleNumber, quantity },
          ]);
        }

        // Reset form and focus on article search
        setNewArticle({ articleNumber: '', quantity: '' });
        setTimeout(() => {
          articleSearchRef.current?.focus();
        }, 100);
      }
    }
  };

  const removeArticle = (index: number) => {
    const updatedArticles = value.filter((_, i) => i !== index);
    onChange(updatedArticles);
  };

  const updateQuantity = (index: number, quantity: number) => {
    const updatedArticles = [...value];
    updatedArticles[index].quantity = quantity;
    onChange(updatedArticles);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addArticle();
    }
  };

  return (
    <div className='space-y-4'>
      {label && <h3 className='text-base font-semibold'>{label}</h3>}

      {/* Existing articles table */}
      {value.length > 0 && (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numer artykułu</TableHead>
                <TableHead>Nazwa</TableHead>
                <TableHead className='w-32 text-center'>Ilość</TableHead>
                <TableHead className='w-16 text-center'>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articlesWithDetails.map((article, index) => (
                <TableRow key={index}>
                  <TableCell className='font-medium'>
                    {article.articleNumber}
                  </TableCell>
                  <TableCell>
                    <span>{article.name || 'Ładowanie...'}</span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      value={article.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        updateQuantity(index, value);
                      }}
                      className='text-center'
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => removeArticle(index)}
                      className='h-8 w-8 p-0'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add new article form */}
      <div className='flex w-full gap-2'>
        <div className='min-w-0 flex-[4]'>
          <ArticleSearch
            ref={articleSearchRef}
            value={newArticle.articleNumber}
            onSelect={(articleNumber) => {
              setNewArticle((prev) => ({ ...prev, articleNumber }));
            }}
            placeholder={placeholder}
          />
        </div>
        <div className='flex min-w-[140px] flex-[1] gap-2'>
          <Input
            type='number'
            min={1}
            step={1}
            value={newArticle.quantity}
            onChange={(e) =>
              setNewArticle((prev) => ({ ...prev, quantity: e.target.value }))
            }
            onKeyDown={handleKeyDown}
            placeholder='szt.'
            className='min-w-[80px] flex-1'
          />
          <Button
            type='button'
            onClick={addArticle}
            disabled={!newArticle.articleNumber || !newArticle.quantity}
            size='sm'
            className='shrink-0 px-3'
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
