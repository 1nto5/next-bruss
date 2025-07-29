import { ForecastFilterType, ForecastResponse } from './types';

export async function getForecastData(
  filterType: ForecastFilterType,
  year: number,
  startValue: number,
  endValue: number,
  userEmail?: string,
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  forecastData: ForecastResponse;
}> {
  const params = new URLSearchParams({
    filterType,
    year: year.toString(),
    startValue: startValue.toString(),
    endValue: endValue.toString(),
  });

  if (userEmail) {
    params.append('userEmail', userEmail);
  }

  const res = await fetch(
    `${process.env.API}/production-overtime/forecast?${params.toString()}`,
    {
      next: { revalidate: 0, tags: ['production-overtime-forecast'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getForecastData error: ${res.status} ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString();

  const forecastData: ForecastResponse = await res.json();

  return { fetchTime, fetchTimeLocaleString, forecastData };
}
