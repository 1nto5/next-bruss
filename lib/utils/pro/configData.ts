import fs from 'fs'
import path from 'path'

// only pallet label config
const configPathOnlyPalletLabel = path.join(
  process.cwd(),
  'configs/only-pallet-label.json'
)
export const configDataOnlyPalletLabel = JSON.parse(
  fs.readFileSync(configPathOnlyPalletLabel, 'utf8')
)
