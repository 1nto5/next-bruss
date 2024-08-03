import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import Container from '@/components/ui/container';
import { extractNameFromEmail } from '@/lib//utils/nameFormat';
import { Capa, columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getAllCapa(
  lang: string,
): Promise<{ fetchTime: string; allCapa: Capa[] }> {
  const res = await fetch(`${process.env.API}/capa/all-capa`, {
    next: { revalidate: 60 * 15, tags: ['capa'] },
  });

  if (!res.ok) {
    throw new Error('getAllCapa fetch res: ' + res.status);
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  let allCapa = await res.json();
  allCapa = allCapa
    .sort((a: Capa, b: Capa) => {
      const dateA = a.edited?.date ? new Date(a.edited.date) : new Date(0); // Default to epoch if undefined
      const dateB = b.edited?.date ? new Date(b.edited.date) : new Date(0); // Default to epoch if undefined
      return dateB.getTime() - dateA.getTime();
    })
    .map((capa: Capa) => {
      if (capa.edited) {
        const edited = {
          date: new Date(capa.edited.date).toLocaleString(lang),
          email: capa.edited.email,
          name: extractNameFromEmail(capa.edited.email),
        };
        return { ...capa, edited };
      }
      return capa;
    });

  return { fetchTime, allCapa };
}

export default async function CapaPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const { fetchTime, allCapa } = await getAllCapa(lang);
  return (
    <Container>
      <main>
        <DataTable columns={columns} data={allCapa} fetchTime={fetchTime} />
      </main>
    </Container>
  );
}
