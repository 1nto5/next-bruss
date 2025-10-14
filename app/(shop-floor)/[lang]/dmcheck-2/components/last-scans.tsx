'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { Locale } from '@/lib/config/i18n';
import { useScanStore } from '../lib/stores';

interface LastScansProps {
  lang: Locale;
}

export default function LastScans({ lang }: LastScansProps) {
  const { lastScans } = useScanStore();

  if (lastScans.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className='mt-2 mb-2 pb-0'>
        <Table>
          <TableBody>
            {lastScans.map((scan, index) => (
              <TableRow key={index}>
                <TableCell className='font-mono'>{scan.dmc}</TableCell>
                <TableCell className='text-muted-foreground text-right'>
                  {new Date(scan.time).toLocaleTimeString(process.env.DATE_TIME_LOCALE!)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
