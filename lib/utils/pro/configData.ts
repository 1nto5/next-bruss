import fs from 'fs'
import path from 'path'

// only pallet label config
const configPath136153 = path.resolve(
  process.cwd(),
  'configs',
  'config136-153.json'
)

export const config136153 = JSON.parse(
  fs.readFileSync(configPath136153, 'utf8')
)

const configPathEol80 = path.join(process.cwd(), 'configs/configEol80.json')

export const configEol80 = JSON.parse(fs.readFileSync(configPathEol80, 'utf8'))
