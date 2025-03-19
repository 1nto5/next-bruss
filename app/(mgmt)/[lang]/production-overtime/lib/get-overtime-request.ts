'use server';

import {
  overtimeRequestEmployeeType,
  OvertimeType,
} from './production-overtime-types';

export async function getOvertimeRequest(
  lang: string,
  id: string,
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeRequestLocaleString: OvertimeType;
}> {
  const res = await fetch(
    `${process.env.API}/production-overtime/request?id=${id}`,
    {
      next: { revalidate: 0, tags: ['production-overtime-request'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getOvertimeRequest error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(lang);

  const overtimeRequest = await res.json();
  // Transform each employee to include localized agreedReceivingAt
  const employees = overtimeRequest.employees.map(
    (employee: overtimeRequestEmployeeType) => ({
      ...employee,
      agreedReceivingAtLocaleString: employee.agreedReceivingAt
        ? new Date(employee.agreedReceivingAt).toLocaleDateString(lang)
        : null,
    }),
  );

  const overtimeRequestLocaleString = {
    ...overtimeRequest,
    employees,
  };

  return { fetchTime, fetchTimeLocaleString, overtimeRequestLocaleString };
}
