import { useState, FormEvent } from 'react'
import checkOperator from '../utils/checkOperator'
import { logIn } from '../redux/operatorSlice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../redux/store'

import toast from 'react-hot-toast'

type NumberButtonProps = {
  onClick: () => void
  value: number
}

const NumberButton: React.FC<NumberButtonProps> = ({ onClick, value }) => (
  <button
    className="m-4 inline-block h-24 w-24 rounded bg-slate-100 text-center text-4xl text-slate-900 shadow-sm hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
    onClick={onClick}
    type="button"
  >
    {value}
  </button>
)

const NumLogIn = () => {
  const [persNum, setPersNum] = useState('')

  const dispatch = useDispatch<AppDispatch>()

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!persNum) {
      toast.error('Podaj numer personalny!')
      return
    }

    const operator = checkOperator(Number(persNum))

    if (operator) {
      dispatch(logIn({ persNum: Number(persNum), name: operator.name }))
      toast.success(`${persNum} zalogowany!`)
    } else {
      toast.error(`${persNum} nie istnieje!`)
    }
  }

  const handleClickNumber = (calcNum: number) => {
    setPersNum(persNum + calcNum.toString())
  }

  const handleClickClear = () => {
    setPersNum('')
  }

  return (
    <form
      className="mb-4 mt-4 flex flex-col items-center justify-center"
      onSubmit={handleLogin}
    >
      <input
        className="font mt-4 h-20 w-3/12 rounded-lg bg-slate-100 text-center text-4xl text-slate-900 shadow-sm outline-none dark:bg-slate-700 dark:text-slate-100"
        type="text"
        value={persNum}
        onChange={(e) => setPersNum(e.target.value)}
        placeholder="nr personalny"
        autoFocus
      />
      <div className="mt-4">
        <div>
          <NumberButton onClick={() => handleClickNumber(1)} value={1} />
          <NumberButton onClick={() => handleClickNumber(2)} value={2} />
          <NumberButton onClick={() => handleClickNumber(3)} value={3} />
        </div>
        <div>
          <NumberButton onClick={() => handleClickNumber(4)} value={4} />
          <NumberButton onClick={() => handleClickNumber(5)} value={5} />
          <NumberButton onClick={() => handleClickNumber(6)} value={6} />
        </div>
        <div>
          <NumberButton onClick={() => handleClickNumber(7)} value={7} />
          <NumberButton onClick={() => handleClickNumber(8)} value={8} />
          <NumberButton onClick={() => handleClickNumber(9)} value={9} />
        </div>
        <div>
          <button
            className="m-4 inline-block h-24 w-24 rounded bg-red-500 text-center text-4xl text-slate-50 shadow-sm hover:bg-red-700 dark:bg-red-800 dark:text-slate-100 dark:hover:bg-red-600"
            onClick={() => handleClickClear()}
            type="button"
          >
            C
          </button>
          <NumberButton onClick={() => handleClickNumber(0)} value={0} />
          <button
            className="hover hover m-4 h-24 w-24 rounded bg-bruss text-center text-4xl text-slate-50 shadow-sm dark:bg-green-800 dark:text-slate-100 dark:hover:bg-green-700"
            type="submit"
          >
            OK
          </button>
        </div>
      </div>
    </form>
  )
}

export default NumLogIn
