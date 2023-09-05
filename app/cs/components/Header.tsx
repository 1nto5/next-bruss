'use client'

import Link from 'next/link'
import moment from 'moment'
import { useState } from 'react'

export default function Header({ selectedDate }: { selectedDate: string }) {
  const [date, setDate] = useState(moment())

  const handleDateChange = (newDate: moment.Moment) => {
    setDate(newDate)
  }

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 p-4 shadow-md dark:border-slate-700 dark:bg-slate-800">
      <h1 className="text-lg font-thin text-slate-900 dark:text-slate-100">
        CS
      </h1>

      <div>
        <p>Current week: {date.week()}</p>
        <p>Wybrana data: {selectedDate}</p>
        <input
          type="date"
          value={date.format('YYYY-MM-DD')}
          onChange={(e) => handleDateChange(moment(e.target.value))}
        />
      </div>
      <nav>
        <Link href="/login">Login</Link>
      </nav>
    </div>
  )
}
