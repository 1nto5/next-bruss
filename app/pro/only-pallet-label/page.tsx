'use client'

import { useAppSelector } from '../redux/store'

import Status from './components/Status'
import NumLogIn from '../components/NumLogIn'

export default function OnlyPalletLabel() {
  // check auth status
  const isAuth = useAppSelector(
    (state) => state.operatorAuthReducer.value.isAuth
  )

  return (
    <div>
      {isAuth && <Status />}
      {!isAuth && <NumLogIn />}
      {/* <WorkplaceCard workplaceName="test" /> */}
    </div>
  )
}
