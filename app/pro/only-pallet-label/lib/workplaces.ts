import fs from 'fs'
import path from 'path'

type Article = {
  number: number
  name: string
  palletSize: number
}

type Workplace = {
  workplace: string
  articles: Article[]
}

const filePath = path.join(process.cwd(), 'configs', 'onlyPalletLabel.json')

export function getWorkplaces(): string[] {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const data: Workplace[] = JSON.parse(fileContents)
  const workplaces: string[] = data.map((item) => item.workplace)
  return workplaces
}
