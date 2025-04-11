import getEmployees from '@/lib/get-employees';
import AddDayOff from '../../components/add-day-off-form';

export default async function AddDayOffPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const employees = await getEmployees();
  return <AddDayOff employees={employees} id={id} />;
}
