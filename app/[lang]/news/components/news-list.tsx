import { NewsCard } from './news-card';
import { NewsType } from '../lib/types';

interface NewsListProps {
  news: NewsType[];
  isAdmin: boolean;
  lang: string;
  dict: any;
}

export function NewsList({ news, isAdmin, lang, dict }: NewsListProps) {
  return (
    <div className='space-y-4'>
      {news.map((item) => (
        <NewsCard
          key={item._id}
          news={item}
          isAdmin={isAdmin}
          lang={lang}
          dict={dict}
        />
      ))}
    </div>
  );
}