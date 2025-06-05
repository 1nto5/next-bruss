import { dbc } from '@/lib/mongo';
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
    status: 'box',
    workplace: articleConfig.workplace,
    article: articleConfig.articleNumber,
  });
  return {
    piecesInBox: count,
    boxIsFull: count >= articleConfig.piecesPerBox,
    articleConfig,
  };
}

async function printHydraLabel(
  identifier: string,
  quantity: string | number,
  printHydraLabelAipIp: string,
  printHydraLabelAipWorkplacePosition: number,
) {
  try {
    const response = await fetch(`${process.env.API}/dmcheck/hydra-print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        quantity,
        printHydraLabelAipIp,
        printHydraLabelAipWorkplacePosition,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Auto-print Hydra label error:', error);
    return false;
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const articleConfigId = searchParams.get('articleConfigId') ?? '';
  const identifier = searchParams.get('identifier');
  const quantity = searchParams.get('quantity');
  const printHydraLabelAipIp = searchParams.get('printHydraLabelAipIp');
  const printHydraLabelAipWorkplacePosition = searchParams.get(
    'printHydraLabelAipWorkplacePosition',
  );

  if (typeof articleConfigId === 'string' && articleConfigId.length === 24) {
    const boxStatus = await getBoxStatus(articleConfigId);
    if (!boxStatus) {
      return new NextResponse(JSON.stringify({ message: 'article not found' }));
    }

    // Auto-print Hydra label if box is full and print config is provided
    if (boxStatus.boxIsFull && printHydraLabelAipIp && identifier && quantity) {
      await printHydraLabel(
        identifier,
        quantity,
        printHydraLabelAipIp,
        Number(printHydraLabelAipWorkplacePosition) || 1,
      );

      return new NextResponse(
        JSON.stringify({
          ...boxStatus,
        }),
      );
    }

    return new NextResponse(JSON.stringify(boxStatus));
  } else {
    return new NextResponse(JSON.stringify({ message: 'article not found' }));
  }
}
