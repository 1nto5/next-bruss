import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { getDictionary } from '@/lib/dict';
import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { notFound, redirect } from 'next/navigation';
import NewsForm from '../../components/news-form';

async function getNews(id: string) {
  try {
    const collection = await dbc('news');
    // Try first as ObjectId if valid, otherwise search by string id
    let result;
    if (ObjectId.isValid(id)) {
      result = await collection.findOne({ _id: new ObjectId(id) });
    } else {
      result = await collection.findOne({ _id: id as any });
    }
    if (!result) return null;

    return {
      _id: result._id.toString(),
      title: result.title,
      content: result.content,
      author: result.author,
      isPinned: result.isPinned,
      createdAt:
        typeof result.createdAt === 'string'
          ? result.createdAt
          : result.createdAt.toISOString(),
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
