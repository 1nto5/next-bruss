'use client'

import { useState, useEffect } from 'react'
import { FaExpand, FaCompress } from 'react-icons/fa'

const FullScreenToggle: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  const openFullscreen = (elem: HTMLElement) => {
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if ((elem as any).msRequestFullscreen) {
      ;(elem as any).msRequestFullscreen()
    } else if ((elem as any).webkitRequestFullscreen) {
      ;(elem as any).webkitRequestFullscreen()
    }
  }

  const closeFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).msExitFullscreen) {
      ;(document as any).msExitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      ;(document as any).webkitExitFullscreen()
    }
  }

  const handleFullScreenToggle = () => {
    isFullscreen ? closeFullscreen() : openFullscreen(document.documentElement)
    setIsFullscreen(!isFullscreen)
  }

  return (
    <button onClick={handleFullScreenToggle} className="text-3xl">
      {isFullscreen ? <FaCompress /> : <FaExpand />}
    </button>
  )
}

export default FullScreenToggle
