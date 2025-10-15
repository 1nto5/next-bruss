'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatTime } from '@/lib/utils/date-format';
import { useScanStore } from '../lib/stores';

export default function LastScans() {
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
