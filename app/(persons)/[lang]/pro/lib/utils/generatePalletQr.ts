import { v4 as uuidv4 } from 'uuid';

const generatePalletQr = (
  article: string,
  piecesOnPallet: number,
  processNumber: string,
) => {
  return `A:${article}|O:${processNumber}|Q:${piecesOnPallet}|B:AA${uuidv4()
    .slice(0, 8)
    .toUpperCase()}|C:G`;
};

export default generatePalletQr;
