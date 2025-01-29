'use client';
import Login from './components/login';
import PositionEdit from './components/position-edit';
import { useLogin } from './lib/stores';

// import { getDictionary } from '@/lib/dictionary';

export default function App() {
  const { operator1 } = useLogin();
  if (!operator1) {
    return <Login />;
  } else {
    // return <PositionEdit />;
  }
}
