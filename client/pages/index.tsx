import { useEffect } from 'react';
import { useRouter } from 'next/router';
import HomePage from './home';

export default function Index() {
  const router = useRouter();
  
  // For now, just show the home page
  // You can add logic here to redirect based on auth status
  return <HomePage />;
}
