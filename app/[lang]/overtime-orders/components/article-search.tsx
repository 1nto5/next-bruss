'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils/cn';
import { Check, ChevronsUpDown } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

type Article = {
  _id: string;
  number: string;
  name: string;
  unit: string;
};

interface ArticleSearchProps {
  value?: string;
  onSelect: (articleNumber: string) => void;
  placeholder?: string;
}

export interface ArticleSearchRef {
  focus: () => void;
}

export const ArticleSearch = forwardRef<ArticleSearchRef, ArticleSearchProps>(
  function ArticleSearch(
    { value, onSelect, placeholder = 'Wybierz artykuł' },
    ref,
  ) {
    const [open, setOpen] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useImperativeHandle(ref, () => ({
      focus: () => {
        setOpen(true);
      },
    }));

    useEffect(() => {
      if (searchQuery.length >= 2) {
        fetch(
          `/api/inventory-articles?query=${encodeURIComponent(searchQuery)}`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setArticles(data);
            } else {
              setArticles([]);
            }
          })
          .catch(() => {
            setArticles([]);
          });
      } else {
        setArticles([]);
      }
    }, [searchQuery]);

    const selectedArticle = articles.find(
      (article) => article.number === value,
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className='w-full justify-between'
          >
            {selectedArticle
              ? `${selectedArticle.number} - ${selectedArticle.name}`
              : placeholder}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[300px] p-0' side='bottom' align='start'>
          <Command>
            <CommandInput
              placeholder='Wyszukaj po numerze lub nazwie...'
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {searchQuery.length < 2
                  ? 'Wprowadź co najmniej 2 znaki'
                  : 'Nie znaleziono artykułów'}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key='reset'
                  onSelect={() => {
                    onSelect('');
                    setOpen(false);
                  }}
                >
                  <Check className='mr-2 h-4 w-4 opacity-0' />
                  Nie wybrano
                </CommandItem>
                {articles.map((article) => (
                  <CommandItem
                    key={article._id}
                    value={article.number}
                    onSelect={(currentValue) => {
                      onSelect(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === article.number ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className='flex flex-col'>
                      <span className='font-medium'>{article.number}</span>
                      <span className='text-muted-foreground text-sm'>
                        {article.name} ({article.unit})
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
