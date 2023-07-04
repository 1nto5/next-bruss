import React from 'react'
import {
  StatusBox,
  StatusBoxBlinking,
  BoxSeparator,
} from '@/app/pro/components/StatusElements'

type StatusProps = {
  operator: string
  article: string
  workStage: number
  box: string
  palletBox: boolean
  pallet: string
}

const Status: React.FC<StatusProps> = (props) => {
  return (
    <div className=" mb-10 flex h-40 flex-row items-center justify-between bg-slate-100 shadow-md dark:bg-slate-800">
      <StatusBox boxName="operator:" value={props.operator} />
      <BoxSeparator />
      <StatusBox boxName="artykuł:" value={props.article} />
      <BoxSeparator />

      {props.workStage === 1 ? (
        <StatusBoxBlinking boxName="na palecie:" value={121} />
      ) : (
        <StatusBox boxName="na palecie:" value={123} />
      )}
    </div>
  )
}

export default Status
