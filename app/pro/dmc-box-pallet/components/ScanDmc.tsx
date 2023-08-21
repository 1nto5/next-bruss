import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateLastScan } from '@/lib/redux/pro/dmc-box-pallet/workplaceSlice'
import { saveDmc } from '../actions'
import { useTransition } from 'react'
import toast from 'react-hot-toast'

type StatusProps = {
  workplace: string
}

// Component to scan DMC
export default function ScanDmc({ workplace }: StatusProps) {
  // Use the article number from the Redux state
  const articleNumber = useSelector(
    (state: { article: { articleNumber: number; articleName: number } }) =>
      state.article.articleNumber
  )

  // Use the operator number from the Redux state
  const operatorPersonalNumber = useSelector(
    (state: {
      operator: { personalNumber: number; name: string; loggedIn: boolean }
    }) => state.operator.personalNumber
  )

  // React transition state
  const [isPending, startTransition] = useTransition()

  // Local state for the hydra batch
  const [dmc, setDmc] = useState('')

  // Function to clear input field
  const clearInput = () => {
    setDmc('')
  }

  const dispatch = useDispatch()

  // Handle key press on input (only interested in 'Enter')
  const handleEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    clearInput()

    // Start transition (for loading state)
    startTransition(async () => {
      toast.loading('Przetwarzanie...', { id: 'loading' })

      try {
        const result = await saveDmc(
          dmc,
          workplace,
          articleNumber,
          operatorPersonalNumber
        )

        const status = result?.status
        toast.dismiss()
        // Display toast message based on the result status
        switch (status) {
          case 'saved':
            dispatch(updateLastScan(dmc))
            toast.success('DMC OK!', { id: 'success' })
            break
          case 'exists':
            toast.error('DMC istnieje!', { id: 'error' })
            break
          case 'invalid':
            toast.error('DMC niepoprawny!', { id: 'error' })
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
        value={dmc}
        onChange={(event) => setDmc(event.target.value)}
        onKeyDown={handleEnter}
        placeholder="HYDRA QR"
        autoFocus
      />
    </div>
  )
}
