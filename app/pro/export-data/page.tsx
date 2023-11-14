'use server';

import Header from '../components/Header';
import Form from './components/Form';

export default async function Page() {
  return (
    <>
      <Header
        title='export data'
        showArticleLogOut={false}
        showPersonLogOut={false}
      />
      <Form />
    </>
  );
}
