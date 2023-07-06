'use client'

import { useAppSelector } from '../redux/hooks'

import Status from './components/Status'
import NumLogIn from '../components/NumLogIn'

export default function OnlyPalletLabel() {
  // check auth status
  const isAuth = useAppSelector((state) => state.user.loggedIn)

  return (
    <div>
      {isAuth && <Status />}
      {!isAuth && <NumLogIn />}
      {/* <WorkplaceCard workplaceName="test" /> */}
    </div>
  )
}
