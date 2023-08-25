import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@/lib/redux/pro/dmc-box-pallet/hooks'
import {
  toggleIsFullPallet,
  updateLastScan,
} from '@/lib/redux/pro/dmc-box-pallet/workplaceSlice'
import { savePalletBatch } from '@/app/pro/actions'
import { useTransition } from 'react'
import toast from 'react-hot-toast'

type StatusProps = {
  workplace: string
}

// Component to scan Pallet Batch
export default function ScanPalletQr({ workplace }: StatusProps) {
  // Use the article number from the Redux state
  const articleNumber = useAppSelector((state) => state.article.articleNumber)

  // Use the operator number from the Redux state
  const operatorPersonalNumber = useAppSelector(
    (state) => state.operator.personalNumber
  )

  const onPallet = useAppSelector((state) => state.workplace.onPallet)
  const boxSize = useAppSelector((state) => state.workplace.boxSize)
  const quantityOnPallet = onPallet! * boxSize!

  // React transition state
  const [isPending, startTransition] = useTransition()

  // Local state for the pallet batch
  const [palletQr, setPalletQr] = useState('')

  // Function to clear the hydraBatch input field
  const clearPalletQr = () => {
    setPalletQr('')
  }
  const dispatch = useDispatch()

  // Handle key press on input (only interested in 'Enter')
  const handleEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }
    clearPalletQr()

    // Start transition (for loading state)
    startTransition(async () => {
      toast.loading('Przetwarzanie...', { id: 'loading' })

      try {
        const result = await savePalletBatch(
          palletQr,
          workplace,
          articleNumber!,
          quantityOnPallet,
          operatorPersonalNumber!
        )

        const status = result?.status
        toast.dismiss()

        // Display toast message based on the result status
        switch (status) {
          case 'saved':
            dispatch(updateLastScan(palletQr))
            dispatch(toggleIsFullPallet())
            toast.success('Batch OK!', { id: 'success' })
            break
          case 'exists':
            toast.error('Batch istnieje!', { id: 'error' })
            break
          case 'invalid':
            toast.error('Batch niepoprawny!', { id: 'error' })
            break
          case 'wrong article':
            toast.error('Błędny artykuł!', { id: 'error' })
            break
          case 'wrong quantity':
            toast.error('Błędna ilość!', { id: 'error' })
            break
          case 'wrong process':
            toast.error('Błędny proces!', { id: 'error' })
            break
          case 'full pallet':
            toast.error('Pełna paleta!', { id: 'error' })
            break
          default:
            toast.error('Zgłoś się do IT!', { id: 'error' })
        }
      } catch (err) {
        toast.error('Zgłoś się do IT!', { id: 'error' })
      }
    })
  }
  //TODO color if choosed
  return (
    <div className="mt-10 flex items-center justify-center">
      <input
        className="w-1/3 rounded bg-slate-100 p-2 text-center text-4xl shadow-md outline-none dark:bg-slate-800"
        value={palletQr}
        onChange={(event) => setPalletQr(event.target.value)}
        onKeyDown={handleEnter}
        placeholder="Paleta QR"
        autoFocus
      />
    </div>
  )
}
