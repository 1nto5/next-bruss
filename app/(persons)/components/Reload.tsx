'use client'

import { FaRedo } from 'react-icons/fa'

const Reload = () => {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <button onClick={handleReload} className="text-3xl">
      <FaRedo />
    </button>
  )
}

export default Reload
