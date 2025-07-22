'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateOvenTableData() {
  revalidateTag('oven-data-processes');
}

export async function revalidateOvenTemperatureData() {
  revalidateTag('oven-data-temperature');
}
