'use client'

import React, { useState, useMemo } from 'react'
import { useTable } from 'react-table'
import Select from 'react-select' // Upewnij się, że zainstalowałeś tę bibliotekę

type DataRow = {
  position: number
  wip: boolean
  article: string
  quantity: number
  unit: string
  // labelPrinted: Date
  labelPlaced: boolean
}

export default function Table() {
  const [data, setData] = useState<DataRow[]>([
    {
      position: 1,
      wip: false,
      article: 'Artykuł 1',
      quantity: 100,
      unit: 'kg',
      // labelPrinted: new Date(),
      labelPlaced: false,
    },
    {
      position: 2,
      wip: false,
      article: 'Artykuł 1',
      quantity: 100,
      unit: 'kg',
      // labelPrinted: new Date(),
      labelPlaced: false,
    },
    // ... możesz dodać więcej danych
  ])

  const articleSelectOptions = [
    { value: 'Artykuł 1', label: 'Artykuł 1' },
    { value: 'Artykuł 2', label: 'Artykuł 2' },
    // ...dodaj więcej opcji
  ]

  const labelPlaced = (index: number) => {
    const newData = [...data]
    newData[index].labelPlaced = !newData[index].labelPlaced
    setData(newData)
  }

  const columns = useMemo(
    () => [
      {
        Header: 'WIP',
        accessor: 'wip',
        Cell: ({ value }: any) => (
          <input type="checkbox" className="h-6 w-6" checked={value} readOnly />
        ),
      },
      {
        Header: 'Position',
        accessor: 'position',
      },
      {
        Header: 'Article',
        accessor: 'article',
        Cell: ({ row }: any) => (
          <Select
            options={articleSelectOptions}
            className="text-left"
            placeholder="choose"
            value={articleSelectOptions.find(
              (option) => option.value === row.original.article
            )}
            // onChange={(option) => {
            //   const newData = [...data]
            //   newData[row.index].article = option.value
            //   setData(newData)
            // }}
          />
        ),
      },
      {
        Header: 'Quantity',
        accessor: 'quantity',
      },
      {
        Header: 'Unit',
        accessor: 'unit',
      },
      // {
      //   Header: 'Label Print Date',
      //   accessor: 'labelPrinted',
      //   Cell: ({ value }: any) => value.toLocaleDateString(),
      // },
      {
        Header: 'Label Placed',
        accessor: 'labelPlaced',
        Cell: ({ row }: any) => (
          <input
            type="checkbox"
            className="h-6 w-6"
            checked={!!data[row.index].labelPlaced}
            // onChange={() => labelPlaced(row.index)}
          />
        ),
      },
    ],
    [articleSelectOptions]
  )

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    })

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
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
                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// import React, { useState, useEffect, useMemo, useTransition } from 'react'
// import { useTable } from 'react-table'
// import Select from 'react-select'
// import { GetArticles, GetCard, UpdateCard } from '../actions'
// import { usePathname } from 'next/navigation'

// const Table = () => {
//   const pathname = usePathname()
//   const cardNumber = Number(pathname.split('/').pop())

//   const [articles, setArticles] = useState([])
//   const [preLoadingIsPending, startPreLoadingTransition] = useTransition()

//   // Get articles
//   useEffect(() => {
//     const fetchArticles = async () => {
//       try {
//         const data = await GetArticles()
//         setArticles(data)
//       } catch (error) {
//         console.error('Nie udało się pobrać artykułów.', error)
//       }
//     }

//     startPreLoadingTransition(() => {
//       fetchArticles()
//     })
//   }, [])

//   const articleSelectOptions = useMemo(() => {
//     return articles.map((article) => ({
//       value: article,
//       label: article,
//     }))
//   }, [articles])

//   const columns = useMemo(
//     () => [
//       {
//         Header: 'WIP',
//         accessor: 'wip',
//         Cell: () => <input type="checkbox" className="h-6 w-6" />,
//       },
//       {
//         Header: 'pos.',
//         accessor: 'p',
//       },
//       {
//         Header: 'number - name',
//         accessor: 'number-name',
//         Cell: () => (
//           <Select
//             options={articleSelectOptions}
//             className="text-left"
//             placeholder="choose"
//           />
//         ),
//       },
//       {
//         Header: 'quantity / weight',
//         accessor: 'quantity-weight',
//         Cell: () => (
//           <div className="flex items-center justify-center">
//             <input
//               type="number"
//               className="w-full max-w-[150px] rounded border p-2 text-right"
//               placeholder=""
//             />
//           </div>
//         ),
//       },
//       {
//         Header: 'label print',
//         accessor: 'label print',
//         Cell: () => (
//           <button className="rounded bg-blue-500 px-4 py-1 text-white">
//             Print
//           </button>
//         ),
//       },
//       {
//         Header: 'label placed',
//         accessor: 'mark',
//         Cell: ({ row }) => (
//           <input
//             type="checkbox"
//             className="h-6 w-6"
//             checked={!!tableData[row.index].labelPlaced}
//             onChange={() => labelPlaced(row.index)}
//           />
//         ),
//       },
//     ],
//     [articleSelectOptions, tableData]
//   )

//   const [tableData, setTableData] = useState(() =>
//     Array.from({ length: 25 }, (_, index) => ({ position: index + 1 }))
//   )

//   const labelPlaced = async (rowIndex) => {
//     try {
//       // Aktualizuj dane w stanie tableData, oznaczając, że etykieta została umieszczona dla określonego wiersza
//       const updatedData = [...tableData]
//       updatedData[rowIndex].labelPlaced = !updatedData[rowIndex].labelPlaced
//       setTableData(updatedData)

//       // Aktualizuj dane w bazie danych
//       await UpdateCard(cardNumber, { tableData: updatedData })
//       console.log('Dane zapisane pomyślnie.')
//     } catch (error) {
//       console.error('Nie udało się zapisać danych.', error)
//     }
//   }

//   const data = useMemo(() => Array.from({ length: 25 }, () => ({})), [])

//   const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
//     useTable({ columns, data })

//   const [card, setCard] = useState(null)

//   useEffect(() => {
//     const fetchCard = async () => {
//       try {
//         const cardData = await GetCard(cardNumber)
//         console.log('Pobrane dane z karty:', cardData)
//         if (!cardData) {
//           // Jeśli karta nie istnieje, zainicjuj ją w bazie danych
//           const initializedCard = await UpdateCard(cardNumber, {
//             /* tutaj możesz przekazać początkowe wartości dla karty */
//           })
//           setTableData(initializedCard)
//         } else {
//           setTableData(cardData)
//         }
//       } catch (error) {
//         console.error('Nie udało się pobrać lub zainicjować karty.', error)
//       }
//     }

//     startPreLoadingTransition(() => {
//       fetchCard()
//     })
//   }, [cardNumber])

//   // ... (reszta kodu)

//   return (
//     <div>
//       {preLoadingIsPending ? (
//         <div className="flex h-screen items-center justify-center">
//           <div className="h-24 w-24 animate-spin rounded-full border-t-8 border-solid border-bruss"></div>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full" {...getTableProps()}>
//             <thead>
//               {headerGroups.map((headerGroup) => (
//                 <tr
//                   className="bg-gray-800 tracking-widest text-gray-50"
//                   {...headerGroup.getHeaderGroupProps()}
//                 >
//                   {headerGroup.headers.map((column) => (
//                     <th
//                       className="p-2 font-extralight"
//                       {...column.getHeaderProps()}
//                     >
//                       {column.render('Header')}
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <tbody {...getTableBodyProps()}>
//               {rows.map((row) => {
//                 prepareRow(row)
//                 return (
//                   <tr {...row.getRowProps()}>
//                     {row.cells.map((cell) => (
//                       <td
//                         className="border-gray-200 text-center"
//                         {...cell.getCellProps()}
//                       >
//                         {cell.render('Cell')}
//                       </td>
//                     ))}
//                   </tr>
//                 )
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Table

// import React, { useState, useEffect, useTransition } from 'react'
// import { GetArticles, GetCard, UpdateCard } from '../actions'
// import { usePathname } from 'next/navigation'

// const TableWithData = () => {
//   const pathname = usePathname()
//   const cardNumber = Number(pathname.split('/').pop())
//   const [data, setData] = useState()
//   const [cardIsPending, startCardTransition] = useTransition()

//   useEffect(() => {
//     const fetchCard = async () => {
//       try {
//         const cardData = await GetCard(cardNumber)
//         if (!cardData) {
//           // Jeśli karta nie istnieje, zainicjuj ją w bazie danych
//           const initializedCard = await UpdateCard(cardNumber, {
//             /* tutaj możesz przekazać początkowe wartości dla karty */
//           })
//           setData(initializedCard)
//         } else {
//           setData(cardData)
//         }
//       } catch (error) {
//         console.error('Nie udało się pobrać lub zainicjować karty.', error)
//       }
//     }

//   useEffect(() => {
//     fetch('/api/getData') // zmień na odpowiedni endpoint
//       .then((response) => response.json())
//       .then((data) => {
//         setData(data)
//         setLoading(false)
//       })
//   }, [])

//   const updateDataInDb = (rowId, updatedRowData) => {
//     fetch(`/api/updateData/${rowId}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(updatedRowData),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.success) {
//           // Aktualizuj stan po pomyślnym zapisie w bazie danych
//           const updatedData = [...data]
//           const rowIndex = data.findIndex((row) => row.id === rowId)
//           updatedData[rowIndex] = updatedRowData
//           setData(updatedData)
//         } else {
//           console.error('Error updating data in database:', data.message)
//         }
//       })
//   }

//   if (loading) return <div>Loading...</div>

//   return (
//     <table>
//       <thead>
//         <tr>
//           <th>ID</th>
//           <th>Name</th>
//           <th>Action</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((row) => (
//           <tr key={row.id}>
//             <td>{row.id}</td>
//             <td>{row.name}</td>
//             <td>
//               <button onClick={() => updateDataInDb(row.id, row)}>
//                 Update in DB
//               </button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   )
// }

// export default TableWithData
