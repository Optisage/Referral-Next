'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);
  
  return (
    <div className={styles.container}>
      <div className={styles.loadingContainer}>
        <div className={styles.loaderCircle}>
          <div className={styles.spinner}></div>
        </div>
        <h2 className={styles.loadingText}>Loading...</h2>
      </div>
    </div>
  );
}
