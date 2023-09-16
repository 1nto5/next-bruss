'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTable } from 'react-table'
import Select from 'react-select'
import { GetArticles } from '../actions' // Upewnij się, że ścieżka do funkcji jest poprawna

const Table = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await GetArticles()
        setArticles(data)
        setLoading(false)
      } catch (error) {
        console.error('Nie udało się pobrać artykułów.', error)
        setLoading(false)
      }
    }
    fetchArticles()
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
        Header: 'p.',
        accessor: 'p',
      },
      {
        Header: 'numer - nazwa',
        accessor: 'number-name',
        Cell: () =>
          loading ? (
            <span>Loading...</span>
          ) : (
            <Select
              options={articleSelectOptions}
              className="text-left"
              placeholder="wybierz"
              menuPortalTarget={document.body}
            />
          ),
      },
      {
        Header: 'ilość / waga',
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
        Header: 'etykieta',
        accessor: 'label',
        Cell: () => (
          <button className="rounded bg-blue-500 px-4 py-1 text-white">
            Wydruk
          </button>
        ),
      },
      {
        Header: 'oznacz',
        accessor: 'mark',
        Cell: () => <input type="checkbox" className="h-6 w-6" />,
      },
    ],
    [articleSelectOptions, loading]
  )

  const data = useMemo(() => Array.from({ length: 25 }, () => ({})), [])

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data })

  return (
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
  )
}

export default Table
