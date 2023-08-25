import { ReduxProvider } from '@/lib/redux/pro/dmc-box-pallet/provider'

export default function DmcBoxPallet({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ReduxProvider>{children}</ReduxProvider>
    </>
  )
}
