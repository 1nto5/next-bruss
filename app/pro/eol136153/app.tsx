'use client';

import { useContext } from 'react';
import { PersonContext } from '../lib/PersonContext';
import { ArticleContext } from '../lib/ArticleContext';
import NumLogIn from '../components/NumLogIn';
import Status from './components/Status';

export default function App() {
  const personContext = useContext(PersonContext);
  const articleContext = useContext(ArticleContext);

  return (
    //     <>
    //       {!personContext?.person.number ? (
    //         <Login />
    //       ) : (
    //         <>
    //           <Status />
    //           <div className='mb-4 mt-4 flex flex-col items-center justify-center'>
    //             {!inventoryContext?.inventory.card ? (
    //               <Card />
    //             ) : !inventoryContext?.inventory.position ? (
    //               <Position />
    //             ) : (
    //               <Edit />
    //             )}
    //           </div>
    //         </>
    //       )}
    //     </>
    //   );

    <>
      {!personContext?.person.number && <NumLogIn />}
      <Status />
    </>
  );
}
