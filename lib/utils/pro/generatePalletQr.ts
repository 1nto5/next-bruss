import { v4 as uuidv4 } from 'uuid'

const generatePalletQr = (
  article: number,
  quantityOnPallet: number,
  workplaceType: string
) => {
  return `A:${article}|O:000|Q:${quantityOnPallet}|B:${workplaceType}${uuidv4()
    .slice(0, 8)
    .toUpperCase()}|C:G`
}

export default generatePalletQr
