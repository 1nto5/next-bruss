import { useState } from 'react'
import { useSelector } from 'react-redux'
import { saveHydraBatch } from '../actions'
import { useTransition } from 'react'
import toast from 'react-hot-toast'

// Component to scan Hydra Batch
export default function ScanHydraBatch() {
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
  const [hydraBatch, setHydraBatch] = useState('')

  // Handle key press on input (only interested in 'Enter')
  const handleEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    // Start transition (for loading state)
    startTransition(async () => {
      toast.loading('Przetwarzanie...', { id: 'loading' })

      try {
        const result = await saveHydraBatch(
          hydraBatch,
          articleNumber,
          operatorPersonalNumber
        )

        const status = result?.status
        toast.dismiss()

        // Display toast message based on the result status
        switch (status) {
          case 'saved':
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
          default:
            toast.error('Zgłość się do IT!', { id: 'error' })
        }
      } catch (err) {
        toast.error('Zgłoś się do IT!', { id: 'error' })
      }
    })
  }

  return (
    <div className="mt-10 flex items-center justify-center">
      <input
        className="w-1/3 rounded bg-slate-100 p-2 text-center text-4xl shadow-md outline-none dark:bg-slate-800"
        value={hydraBatch}
        onChange={(event) => setHydraBatch(event.target.value)}
        onKeyDown={handleEnter}
        placeholder="HYDRA batch"
        autoFocus
      />
    </div>
  )
}
