'use client';

import {
  useTable,
  Column,
  CellProps,
  HeaderGroupProps,
  Row,
} from 'react-table';

type DataType = {
  [key: string]: any;
};

interface DataTableProps {
  data: DataType[];
  columns: Column<DataType>[];
}

export default function DataTable({ data, columns }: DataTableProps) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <table {...getTableProps()} className='table-auto'>
      <thead>
        {headerGroups.map((headerGroup: HeaderGroupProps<DataType>, i) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={i}>
            {headerGroup.headers.map((column: Column<DataType>, j) => (
              <th {...column.getHeaderProps()} key={j}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row: Row<DataType>, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={i}>
              {row.cells.map((cell: CellProps<DataType>, j) => (
                <td {...cell.getCellProps()} key={j}>
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
