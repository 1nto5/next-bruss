import { getWorkplaces } from './lib/workplaces'
import WorkplaceCard from '../components/WorkplaceCard'

const workplaces: string[] = getWorkplaces()

export default function Home() {
  return <WorkplaceCard workplaceName="test" />
}
