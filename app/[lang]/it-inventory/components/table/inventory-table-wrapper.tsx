'use client';

import { Session } from 'next-auth';
import { Dictionary } from '../../lib/dict';
import { ITInventoryItem } from '../../lib/types';
import { DataTable } from './data-table';
import { createColumns } from './columns';

export default function InventoryTableWrapper({
  items,
  session,
  dict,
  lang,
}: {
  items: ITInventoryItem[];
  session: Session | null;
  dict: Dictionary;
  lang: string;
}) {
  const columns = createColumns(session, dict, lang);

  return <DataTable columns={columns} data={items} session={session} dict={dict} />;
}
