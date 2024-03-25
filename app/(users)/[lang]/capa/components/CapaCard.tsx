'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AddCapaFormDialog from './AddCapaFormDialog';

export default function CapaCard({ cDict }: { cDict: any }) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cDict.cardTitle}</CardTitle>
        <div className='flex justify-between'>
          <div />
          <div className='flex-nowrap'>
            <AddCapaFormDialog
              cDict={cDict.addCapaFormDialog}
              isOpen={isDialogOpen}
              onOpenChange={(value) => {
                setIsDialogOpen(value);
                if (!value) {
                  console.log('test');
                  null;
                }
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>TODO</CardContent>
    </Card>
  );
}
