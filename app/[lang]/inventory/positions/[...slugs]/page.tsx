import { PositionType } from '@/app/[lang]/inventory/lib/types';
import { Locale } from '@/lib/config/i18n';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { getDictionary } from '@/app/[lang]/inventory/lib/dict';
import EditPositionForm from '@/app/[lang]/inventory/positions/components/edit-position-form';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import LocalizedLink from '@/components/localized-link';
import { ArrowLeft } from 'lucide-react';

async function getPosition(identifier: string): Promise<PositionType | null> {
  try {
    const [cardNumber, positionNumber] = identifier.split('/');
    const res = await fetch(
      `${process.env.API}/inventory/card-positions?card-number=${cardNumber}`,
      {
        next: { revalidate: 0, tags: ['inventory-card-positions'] },
      },
    );

    if (!res.ok) {
      return null;
    }

    const data: { positions: PositionType[] } = await res.json();
    const position = data.positions.find(
      (p) => p.position === Number(positionNumber),
    );

    if (!position) {
      return null;
    }

    return {
      ...position,
      approver: position.approver ? extractNameFromEmail(position.approver) : '',
    };
  } catch (error) {
    console.error('getPosition error:', error);
    return null;
  }
}

export default async function EditPositionPage(props: {
  params: Promise<{ lang: Locale; slugs: string[] }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { lang, slugs } = params;

  // slugs format: ["cardNumber", "positionNumber", "edit"]
  if (slugs.length < 2 || slugs[slugs.length - 1] !== 'edit') {
    throw new Error('Invalid URL');
  }

  // Reconstruct identifier from first two slugs: ["162", "1"] → "162/1"
  const identifier = `${slugs[0]}/${slugs[1]}`;

  const dict = await getDictionary(lang);
  const position = await getPosition(identifier);

  if (!position) {
    throw new Error('Position not found');
  }

  // Get return URL from query params and strip language prefix if present
  const rawReturnUrl = searchParams.returnUrl || `/inventory/${slugs[0]}`;
  const returnUrl = rawReturnUrl.replace(/^\/[a-z]{2}(?=\/|$)/, '') || `/inventory/${slugs[0]}`;

  return (
    <Card className='sm:w-[768px]'>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>
            {dict.editDialog.title.replace('{identifier}', position.identifier)}
          </CardTitle>
          <LocalizedLink href={returnUrl}>
            <Button variant='outline'>
              <ArrowLeft /> <span>{dict.cardPositions.table.backToCards}</span>
            </Button>
          </LocalizedLink>
        </div>
      </CardHeader>
      <Separator className='mb-4' />

      <EditPositionForm
        position={position}
        dict={dict}
        returnUrl={returnUrl}
      />
    </Card>
  );
}
