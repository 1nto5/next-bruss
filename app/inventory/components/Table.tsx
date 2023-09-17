'use client'

import React, { useState, useEffect, useMemo, useTransition } from 'react'
import { useTable } from 'react-table'
import Select from 'react-select'
import { GetArticles, GetCard, UpdateCard } from '../actions'
import { usePathname } from 'next/navigation'

const Table = () => {
  const pathname = usePathname()
  const cardNumber = pathname.split('/').pop()
  console.log(cardNumber)

  const [articles, setArticles] = useState([])
  const [preLoadingIsPending, startPreLoadingTransition] = useTransition()

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await GetArticles()
        setArticles(data)
      } catch (error) {
        console.error('Nie udało się pobrać artykułów.', error)
      }
    }

    startPreLoadingTransition(() => {
      fetchArticles()
    })
  }, [])

  const articleSelectOptions = useMemo(() => {
    return articles.map((article) => ({
      value: article,
      label: article,
    }))
  }, [articles])

  const columns = useMemo(
    () => [
      {
        Header: 'WIP',
        accessor: 'wip',
        Cell: () => <input type="checkbox" className="h-6 w-6" />,
      },
      {
        Header: 'pos.',
        accessor: 'p',
      },
      {
        Header: 'number - name',
        accessor: 'number-name',
        Cell: () => (
          <Select
            options={articleSelectOptions}
            className="text-left"
            placeholder="choose"
            menuPortalTarget={document.body}
          />
        ),
      },
      {
        Header: 'quantity / weight',
        accessor: 'quantity-weight',
        Cell: () => (
          <div className="flex items-center justify-center">
            <input
              type="number"
              className="w-full max-w-[150px] rounded border p-2 text-right"
              placeholder=""
            />
          </div>
        ),
      },
      {
        Header: 'label print',
        accessor: 'label',
        Cell: () => (
          <button className="rounded bg-blue-500 px-4 py-1 text-white">
            Print
          </button>
        ),
      },
      {
        Header: 'label placed',
        accessor: 'mark',
        Cell: () => <input type="checkbox" className="h-6 w-6" />,
      },
    ],
    [articleSelectOptions]
  )

  const data = useMemo(() => Array.from({ length: 25 }, () => ({})), [])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data })

  return (
    <div>
      {preLoadingIsPending ? (
        <div className="flex h-screen items-center justify-center">
          <div className="h-24 w-24 animate-spin rounded-full border-t-8 border-solid border-bruss"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr
                  className="bg-gray-800 tracking-widest text-gray-50"
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map((column) => (
                    <th
                      className="p-2 font-extralight"
                      {...column.getHeaderProps()}
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row)
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td
                        className="border-gray-200 text-center"
                        {...cell.getCellProps()}
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Table
