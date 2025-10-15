'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatTime } from '@/lib/utils/date-format';
import { useEOLStore } from '../lib/stores';

export default function LastScans() {
  const { lastScans } = useEOLStore();

  if (lastScans.length === 0) {
    return null;
  }

  const getArticleName = (article: string) => {
    return article === '28067' ? 'M-136-K-1-A' : 'M-153-K-C';
  };

  return (
    <Card>
      <CardContent className='mt-2 mb-2 pb-0'>
        <Table>
          <TableBody>
            {lastScans.slice(0, 5).map((scan, index) => (
              <TableRow key={`${scan.batch}-${index}`}>
                <TableCell className='font-mono'>
                  {scan.batch} ({getArticleName(scan.article)})
                </TableCell>
                <TableCell className='text-muted-foreground text-right'>
                  {formatTime(scan.time)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
