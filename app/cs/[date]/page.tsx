import Header from '../components/Header'
import Table from '../components/Table'

const data = [
  {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
  },
  {
    firstName: 'Jane',
    lastName: 'Doe',
    age: 25,
  },
  // add more objects as needed
]

const columns = [
  {
    Header: 'First Name',
    accessor: 'firstName', // accessor is the "key" in the data
  },
  {
    Header: 'Last Name',
    accessor: 'lastName',
  },
  {
    Header: 'Age',
    accessor: 'age',
  },
  // add more columns as needed
]

export default function Page({ params }: { params: { date: string } }) {
  return (
    <>
      <Header selectedDate={'12.31.123'} />
      <Table data={data} columns={columns} />
    </>
  )
}
