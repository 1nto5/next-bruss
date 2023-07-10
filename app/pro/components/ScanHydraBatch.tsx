import { useState } from 'react'
import { saveHydraBatch } from '../only-pallet-label/actions'
import { startTransition, useTransition } from 'react'
import toast from 'react-hot-toast'

export default function ScanHydraBatch() {
  const [hydraBatch, setHydraBatch] = useState('')

  const handleKeyDown = async () => {
    startTransition(() => {
      toast.promise(saveHydraBatch(hydraBatch), {
        loading: 'Zapisywanie...',
        success: (result) => {
          // Handle success status
          if (result) {
            return 'Hydra batch saved successfully!'
          }
        },
        error: 'Failed to save Hydra batch!',
      })
    })
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <input
        className="rounded bg-slate-100 p-2 text-center shadow-md outline-none dark:bg-slate-800"
        value={hydraBatch}
        onChange={(event) => setHydraBatch(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Scan Hydra"
        autoFocus={true}
      />
    </div>
  )
}
