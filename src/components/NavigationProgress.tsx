'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NavigationProgress() {
  const { pageLoading } = useAuth();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset progress when pathname changes
    setProgress(0);
  }, [pathname]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (pageLoading) {
      setIsVisible(true);
      setProgress(0);
      
      // Simulate progress
      timer = setInterval(() => {
        setProgress(prev => {
          // Slow down progress as it gets higher
          const increment = Math.max(1, 15 - Math.floor(prev / 10));
          const newProgress = prev + increment;
          
          // Don't let it reach 100% until actually loaded
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 100);
    } else {
      if (isVisible) {
        // Complete the progress bar
        setProgress(100);
        
        // Hide after completion animation
        timer = setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pageLoading, isVisible]);

  if (!isVisible && !pageLoading) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease-out' }}
    >
      <div 
        className="h-full bg-whatsapp-green"
        style={{ 
          width: `${progress}%`, 
          transition: 'width 0.2s ease-in-out',
          boxShadow: '0 0 10px rgba(37, 211, 102, 0.7)'
        }}
      />
    </div>
  );
} 