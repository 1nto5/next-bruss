'use client'

import { useAppSelector } from '../redux/store'

import NumLogIn from '../components/NumLogIn'

export default function OnlyPalletLabel() {
  const isAuth = useAppSelector(
    (state) => state.operatorAuthReducer.value.isAuth
  )
  return (
    <>
      {!isAuth && <NumLogIn />}

      {/* <WorkplaceCard workplaceName="test" /> */}
    </>
  )
}
