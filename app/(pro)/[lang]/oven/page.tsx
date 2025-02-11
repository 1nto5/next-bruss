'use client';
import Login from './components/login';
import { useCodeStore } from './lib/stores';

// import { getDictionary } from '@/lib/dictionary';

export default function App() {
  const { code1 } = useCodeStore();
  if (!code1) {
    return <Login />;
  } else {
    ('test');
  }
}
