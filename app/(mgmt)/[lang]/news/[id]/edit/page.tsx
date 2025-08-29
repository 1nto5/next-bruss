import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import NewsForm from '../../components/news-form';
import { ObjectId } from 'mongodb';
import { dbc } from '@/lib/mongo';
import { getDictionary } from '@/lib/dictionary';
import { Locale } from '@/i18n.config';

async function getNews(id: string) {
  try {
    const collection = await dbc('news');
    // Try first as ObjectId, then as string if it fails
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    
    const result = await collection.findOne(query);
    if (!result) return null;
    
    return {
      _id: result._id.toString(),
      title: result.title,
      content: result.content,
      author: result.author,
      isPinned: result.isPinned,
      createdAt: typeof result.createdAt === 'string' ? result.createdAt : result.createdAt.toISOString()
    };
  } catch (error) {
    console.error('getNews error:', error);
    return null;
  }
}

export default async function EditNewsPage(props: {
  params: Promise<{ id: string; lang: Locale }>;
}) {
  const params = await props.params;
  const { id, lang } = params;
  
  const session = await auth();
  
  if (!session?.user?.roles?.includes('admin')) {
    redirect(`/${lang}`);
  }
  
  const news = await getNews(id);
  if (!news) {
    notFound();
  }
  
  const dict = await getDictionary(lang);
  
  return <NewsForm news={news} lang={lang} dict={dict} />;
}