import { v4 as uuidv4 } from 'uuid'

const generatePalletQr = (
  article: number,
  quantityOnPallet: number,
  workplaceType: string
) => {
  return `A:${article}|O:${workplaceType}|Q:${quantityOnPallet}|B:AA${uuidv4()
    .slice(0, 8)
    .toUpperCase()}|C:G`
}

export default generatePalletQr
