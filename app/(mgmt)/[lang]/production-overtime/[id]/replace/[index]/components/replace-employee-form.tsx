'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { EmployeeType } from '@/lib/types/employee-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleX, Save, Table } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { replaceEmployee as update } from '../../../../actions';
import { overtimeRequestEmployeeType } from '../../../../lib/production-overtime-types';
import { SelectEmployee } from './select-employee';

// Update the schema to use a single employee instead of an array
const ReplaceEmployeeSchema = z.object({
  employee: z
    .object({
      identifier: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      agreedReceivingAt: z.date().optional(),
      note: z.string().optional(),
    })
    .nullable(),
});

export default function ReplaceEmployeeForm({
  employees,
  requestId,
  currentEmployeeIndex,
  currentEmployeeData,
}: {
  employees: EmployeeType[];
  requestId: string;
  currentEmployeeIndex: number;
  currentEmployeeData: overtimeRequestEmployeeType;
}) {
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof ReplaceEmployeeSchema>>({
    resolver: zodResolver(ReplaceEmployeeSchema),
    defaultValues: {
      employee: null,
    },
  });

  const onSubmit = async (data: z.infer<typeof ReplaceEmployeeSchema>) => {
    setIsPendingUpdate(true);
    try {
      const res = await update(requestId, currentEmployeeIndex, {
        identifier: data.employee?.identifier || '',
        firstName: data.employee?.firstName || '',
        lastName: data.employee?.lastName || '',
        agreedReceivingAt: data.employee?.agreedReceivingAt,
        note: data.employee?.note,
      });
      if ('success' in res) {
        toast.success('Pracownik został wymieniony!');
        form.reset(); // Reset form after successful submission
        router.back();
      } else if ('error' in res) {
        console.error(res.error);
        toast.error('Skontaktuj się z IT!');
      }
    } catch (error) {
      console.error('onSubmit', error);
      toast.error('Skontaktuj się z IT!');
    } finally {
      setIsPendingUpdate(false);
    }
  };

  return (
    <Card className='sm:w-[768px]'>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>
            Wymiana pracownika: {currentEmployeeData.firstName}{' '}
            {currentEmployeeData.lastName} ({currentEmployeeData.identifier})
          </CardTitle>
          <Link href={`/production-overtime/${requestId}`}>
            <Button variant='outline'>
              <Table /> <span>Powrót do zlecenia</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='grid w-full items-center gap-4'>
            <FormField
              control={form.control}
              name='employee'
              render={({ field }) => (
                <FormItem>
                  <div className='flex flex-col items-start space-y-2'>
                    <FormLabel>Pracownik zastępujący</FormLabel>
                    <FormControl>
                      <SelectEmployee
                        employees={employees}
                        value={field.value}
                        onSelectChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Accordion type='single' collapsible>
              <AccordionItem value='item-1'>
                <AccordionTrigger>
                  Zachowanie nieprzerwanego odpoczynku
                </AccordionTrigger>
                <AccordionContent className='text-justify'>
                  Pracownik zachował co najmniej 11 godzin nieprzerwanego
                  odpoczynku w każdej dobie oraz co najmniej 35 godzin
                  nieprzerwanego odpoczynku tygodniowego (w przypadku
                  pracowników przechodzących na inną zmianę czas odpoczynku nie
                  może być krótszy niż 24 godziny).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='item-2'>
                <AccordionTrigger>Standard Bruss</AccordionTrigger>
                <AccordionContent className='text-justify'>
                  Za pracę w niedzielę i święta pracownik, dla którego jest to
                  7. dzień pracy z kolei, otrzymuje dzień wolny (zgodnie z
                  przepisami KP – patrz: Informacje / podstawy prawne) oraz
                  dodatek do wynagrodzenia w wysokości 100% wynagrodzenia za
                  każdą godzinę pracy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='item-3'>
                <AccordionTrigger>
                  Informacje / podstawy prawne
                </AccordionTrigger>
                <AccordionContent className='text-justify'>
                  <p>
                    1. Zmiany 6.00-14.00; 7.00-15.00; 8.00-16.00; 14.00-22.00;
                    22.00 - 6.00 - norma dobowa czasu pracy 8 godzin
                  </p>
                  <p>
                    2. Czas pracy wraz z pracą nadliczbową nie może przekroczyć
                    13h na dobę - powyżej 13h praca w nadgodzinach jest
                    niedopuszczalna
                  </p>
                  <p>
                    3. Tygodniowy czas pracy łącznie z godzinami nadliczbowymi
                    nie może przekraczać przeciętnie 48 godzin w przyjętym
                    okresie rozliczeniowym
                  </p>
                  <p>
                    4. Zgodnie z przepisami art. 15111 kodeksu pracy pracownik
                    wykonujący pracę w niedziele i święta powinien skorzystać z
                    dnia wolnego od pracy w okresie sześciu dni kalendarzowych
                    poprzedzających lub następujących po takiej niedzieli, za
                    pracę w święto – do końca okresu rozliczeniowego, a jeżeli
                    jest to niemożliwe pracownik ma prawo do innego dnia wolnego
                    od pracy do końca okresu rozliczeniowego. Jeżeli udzielenie
                    takiego dnia także i w tym okresie nie jest możliwe,
                    pracownikowi przysługuje dodatek do wynagrodzenia w
                    wysokości 100% wynagrodzenia za każdą godzinę pracy w
                    niedzielę/święto.
                  </p>
                  <p>
                    W zakładzie funkcjonuje system podstawowy (art. 129 kp –
                    norma dobowa 8h i tygodniowa przeciętna 40h w pięciodniowym
                    tydzień czasu pracy). Podstawa prawna: art. 131, art. 132,
                    art. 133, art. 151&3 i 4, art. 151(1), art. 151(11) Kodeksu
                    pracy.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>

          <CardFooter className='flex flex-col gap-2 sm:flex-row sm:justify-between'>
            <Button
              variant='destructive'
              type='button'
              onClick={() => form.reset()}
              className='w-full sm:w-auto'
            >
              <CircleX className='' />
              Wyczyść
            </Button>
            <div className='flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:space-x-2'>
              <Button
                type='submit'
                className='w-full sm:w-auto'
                disabled={isPendingUpdate}
              >
                <Save className={isPendingUpdate ? 'animate-spin' : ''} />
                Zapisz
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
