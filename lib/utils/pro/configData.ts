import fs from 'fs'
import path from 'path'

// 136-153 config
const configPath136153 = path.resolve(
  process.cwd(),
  'configs',
  'config136-153.json'
)
export const config136153 = JSON.parse(
  fs.readFileSync(configPath136153, 'utf8')
)

// dmc-box-pallet config
const configPathDmcBoxPallet = path.resolve(
  process.cwd(),
  'configs',
  'dmcBoxPallet.json'
)
export const configDmcBoxPallet = JSON.parse(
  fs.readFileSync(configPathDmcBoxPallet, 'utf8')
)
