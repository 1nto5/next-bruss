import { PositionType } from '@/app/(mgmt)/[lang]/inw-2/zatwierdz/lib/types';
import ExcelJS from 'exceljs';

export interface ExportData {
  card: {
    number: number;
    warehouse: string;
    sector: string;
    creators: string;
  };
  positions: PositionType[];
}

export const generateExcelBuffer = async (
  data: ExportData[],
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inventory Positions');

  // Add headers
  worksheet.addRow([
    'beleg',
    'item',
    'T$DSCA',
    'T$DSCB',
    'cwar',
    'stoc',
    'entered',
    'counted_by',
    'delivery_date',
    'bin',
    'id',
  ]);

  // Process data
  data.forEach(({ card, positions }) => {
    if (!Array.isArray(positions)) {
      console.warn(`Card ${card.number} has no positions array`);
      return;
    }

    positions.forEach((position) => {
      const warehouseForPosition = position.wip ? '999' : card.warehouse;
      const beleg = `${card.number.toString().padStart(3, '0')}${position.position.toString().padStart(2, '0')}`;
      const entered = new Date(position.time)
        .toLocaleString('pl-PL')
        .replace(',', '');
      const countedBy = `${card.sector} (${card.creators})`;
      const deliveryDate = position.deliveryDate
        ? new Date(position.deliveryDate)
            .toLocaleString('pl-PL')
            .replace(',', '')
        : '';

      worksheet.addRow([
        beleg,
        position.articleNumber,
        position.articleName,
        '',
        warehouseForPosition,
        position.quantity,
        entered,
        countedBy,
        deliveryDate,
        position.bin || '',
        position.identifier,
      ]);
    });
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
};
