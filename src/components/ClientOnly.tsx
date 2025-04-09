'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
}

export default function ClientOnly({ children }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Don't render anything until component has mounted
  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-whatsapp-light-green p-4">
            <div className="w-16 h-16 border-4 border-whatsapp-green border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 