import { useState } from 'react'

const NumLogin = (props) => {
  const [persNumb, setPersNumb] = useState('')

  const handleChange = (e) => {
    setPersNumb(e)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!persNumb || persNumb.length > 4 || persNumb[0] === '0') {
      setPersNumb('')
      props.errorUserLogin()
      return
    }
    props.userLogin(persNumb)
  }

  const handleClickNumber = (calcNum: Number) => {
    setPersNumb(persNumb + calcNum.toString())
  }

  const handleClickClear = () => {
    setPersNumb('')
  }

  const handleClickBack = () => {
    setPersNumb(persNumb.slice(0, -1))
  }

  return (
    <div>
      <form
        className="flex flex-col items-center justify-center"
        onSubmit={handleSubmit}
      >
        <input
          className="h-20 w-3/12 rounded-lg bg-gray-100 text-center text-5xl caret-transparent shadow-lg outline-none"
          type="text"
          value={persNumb}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="nr personalny"
          autoFocus
        />
        <div className="mt-4">
          <div>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(1)}
              type="button"
            >
              1
            </button>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(2)}
              type="button"
            >
              2
            </button>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(3)}
              type="button"
            >
              3
            </button>
          </div>
          <div>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(4)}
              type="button"
            >
              4
            </button>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(5)}
              type="button"
            >
              5
            </button>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(6)}
              type="button"
            >
              6
            </button>
          </div>
          <div>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(7)}
              type="button"
            >
              7
            </button>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(8)}
              type="button"
            >
              8
            </button>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(9)}
              type="button"
            >
              9
            </button>
          </div>
          <div>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-red-500 hover:text-white"
              onClick={() => handleClickClear()}
              type="button"
            >
              C
            </button>
            <button
              className="m-4 inline-block h-24 w-24 rounded bg-gray-100 text-center text-4xl font-thin text-gray-800 shadow-md transition-colors duration-300 hover:bg-bruss hover:text-white"
              onClick={() => handleClickNumber(0)}
              type="button"
            >
              0
            </button>
            <button
              className="m-4 h-24 w-24 rounded bg-bruss text-center text-4xl font-thin text-white shadow-md transition-colors duration-300 hover:bg-gray-100 hover:text-gray-800"
              type="submit"
            >
              OK
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
export default NumLogin
