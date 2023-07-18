import { FC } from 'react'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

type StatusBoxProps = {
  boxName: string
  value: string
}

export const StatusBox: FC<StatusBoxProps> = ({ boxName, value }) => {
  return (
    <div className="ml-auto mr-auto box-border text-center">
      <p className="text-xl font-thin tracking-widest text-slate-900 dark:text-slate-100">
        {boxName}
      </p>
      <p className="text-3xl text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  )
}

export const StatusBoxBlinking: FC<StatusBoxProps> = ({ boxName, value }) => {
  return (
    <div className="ml-auto mr-auto box-border text-center">
      <p className="text-xl font-thin tracking-widest text-slate-900 dark:text-slate-100">
        {boxName}
      </p>
      <p className="animate-pulse text-3xl text-bruss">{value}</p>
    </div>
  )
}

export const BoxSeparator: FC = () => {
  return (
    <div className="h-20 border-l-2 border-slate-200 dark:border-slate-700"></div>
  )
}

export const StatusBoxSkeleton: FC<StatusBoxProps> = ({ boxName, value }) => {
  return (
    <div className="ml-auto mr-auto box-border text-center">
      <p className="text-xl font-thin tracking-widest text-slate-900 dark:text-slate-100">
        {boxName}
      </p>
      <p className="animate-pulse text-3xl text-bruss">{<Skeleton />}</p>
    </div>
  )
}
