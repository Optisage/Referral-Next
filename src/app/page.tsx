'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      // First check localStorage directly 
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (!loading) {
        if (user || (authToken && userData)) {
          // If either context has user or we have auth data in localStorage, go to dashboard
          router.push('/dashboard');
        } else {
          router.push('/auth/login');
        }
      }
    };
    
    checkAuth();
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
