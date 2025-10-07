import { dbc } from '@/lib/db/mongo';
import { ObjectId } from 'mongodb';
import { NextResponse, type NextRequest } from 'next/server';

async function getBoxStatus(articleConfigId: string) {
  const articlesConfigCollection = await dbc('articles_config');
  const articleConfig = await articlesConfigCollection.findOne({
    _id: new ObjectId(articleConfigId),
  });
  if (!articleConfig) {
    return null;
  }
  const scansCollection = await dbc('scans');
  const count = await scansCollection.countDocuments({
    status: 'pallet',
    workplace: articleConfig.workplace,
    article: articleConfig.articleNumber,
  });
  return {
    boxesOnPallet: count / articleConfig.piecesPerBox,
    palletIsFull:
      count / articleConfig.piecesPerBox >= articleConfig.boxesPerPallet,
  };
}

export async function GET(req: NextRequest) {
  const articleConfigId = req.nextUrl.searchParams.get('articleConfigId') ?? '';
  if (typeof articleConfigId === 'string' && articleConfigId.length === 24) {
    const boxStatus = await getBoxStatus(articleConfigId);
    if (!boxStatus) {
      return new NextResponse(JSON.stringify({ message: 'article not found' }));
    }
    return new NextResponse(JSON.stringify(boxStatus));
  } else {
    return new NextResponse(JSON.stringify({ message: 'article not found' }));
  }
}
