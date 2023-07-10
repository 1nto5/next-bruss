import { useState } from 'react'
import { saveHydraBatch } from '../actions'
import { startTransition, useTransition } from 'react'
import toast from 'react-hot-toast'

export default function ScanHydraBatch() {
  const [hydraBatch, setHydraBatch] = useState('')

  const handleEnter = async (event) => {
    if (event.key !== 'Enter') {
      return
    }

    startTransition(async () => {
      toast.loading('Zapisywanie...')

      try {
        const result = await saveHydraBatch(hydraBatch)
        toast.dismiss() // Dismiss the loading toast here

        if (result.status === 'saved') {
          toast.success('Hydra batch saved successfully!', {
            id: 'success',
          })
        }
      } catch (err) {
        toast.dismiss()

        if (err.message === 'exists') {
          toast.error('Batch istnieje!', {
            id: 'error',
          })
        } else if (err.message === 'invalid') {
          toast.error('Batch niepoprawny!', {
            id: 'error',
          })
        } else if (err.message === 'invalid') {
          toast.error('Batch niepoprawny!', {
            id: 'error',
          })
        } else {
          toast.error('Failed to save Hydra batch!', {
            id: 'error',
          })
        }
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
        autoFocus={true}
      />
    </div>
  )
}
