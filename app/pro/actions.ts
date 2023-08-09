'use server'

import generatePalletQr from '@/lib/utils/pro/generatePalletQr'

//TODO qr process prop
// Generate pallet QR
export async function getPalletQr(
  articleNumber: number,
  quantityOnPallet: number
) {
  try {
    return generatePalletQr(articleNumber, quantityOnPallet, '876')
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while generating pallet qr.')
  }
}
