import Status from './components/Status'
import Header from './components/Header'

export const metadata = {
  title: 'Inventory (Next BRUSS)',
  // description: 'Company helper applications',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header title="inventory" />
      <Status />
      {children}
    </>
  )
}
