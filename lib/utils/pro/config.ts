import fs from 'fs'
import path from 'path'

// production config
const productionConfigPath = path.resolve(
  process.cwd(),
  'configs',
  'production.json'
)

export const productionConfig = JSON.parse(
  fs.readFileSync(productionConfigPath, 'utf8')
)
