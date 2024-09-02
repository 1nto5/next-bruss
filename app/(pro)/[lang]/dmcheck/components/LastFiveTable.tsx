import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Locale } from '@/i18n.config';

export function LastFiveTable({
  cDict,
  lang,
  lastFive,
}: {
  cDict: any;
  lang: Locale;
  lastFive?: { dmc: string; time: string }[];
}) {
  return (
    <div className='flex w-3/4 justify-center'>
      <Table>
        {/* <TableCaption>{cDict.tableCaption}</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead>{cDict.timeTableHead}</TableHead>
            <TableHead>{cDict.dateTableHead}</TableHead>
            <TableHead>DMC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lastFive &&
            lastFive.map((dmc) => (
              <TableRow key={dmc.dmc}>
                <TableCell>
                  {new Date(dmc.time).toLocaleTimeString(lang)}
                </TableCell>
                <TableCell>
                  {new Date(dmc.time).toLocaleDateString(lang)}
                </TableCell>
                <TableCell>{dmc.dmc}</TableCell>
                {/* <TableCell>
                <Button size='icon' type='button' variant='outline'>
                  <Trash2 />
                </Button>
              </TableCell> */}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
