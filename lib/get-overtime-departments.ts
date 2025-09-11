'use server';

import type { DepartmentConfig } from '@/app/(mgmt)/[lang]/overtime-orders/lib/types';

export default async function getOvertimeDepartments(): Promise<DepartmentConfig[]> {
  const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
  const res = await fetch(`${baseUrl}/api/overtime-orders/departments`, {
    next: {
      revalidate: 60 * 60 * 4, // 4 hours
      tags: ['overtime-departments'],
    },
  });

  if (!res.ok) {
    console.error(`getOvertimeDepartments error: ${res.status} ${res.statusText}`);
    return [];
  }
  
  const data = await res.json();
  return data;
}