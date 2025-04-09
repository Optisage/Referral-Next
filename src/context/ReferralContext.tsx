'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Referral {
  id: string;
  userName: string;
  registrationDate: Date;
  status: 'registered' | 'completed';
  pointsEarned?: number;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending';
  pointsEarned: number;
}

interface ReferralStats {
  totalReferrals: number;
  totalPoints: number;
  conversionRate: number;
  growthRateReferrals: number;
  growthRatePoints: number;
  growthRateConversion: number;
}

interface ReferralContextType {
  referrals: Referral[];
  transactions: Transaction[];
  stats: ReferralStats;
  copyReferralLink: () => void;
  generateReferralLink: (userId: string) => string;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export const useReferral = (): ReferralContextType => {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
};

interface ReferralProviderProps {
  children: ReactNode;
}

export const ReferralProvider = ({ children }: ReferralProviderProps) => {
  // Mock data for the demo
  const [referrals] = useState<Referral[]>([
    {
      id: '1',
      userName: 'John D.',
      registrationDate: new Date(new Date().getTime() - 2 * 60 * 1000),
      status: 'registered',
      pointsEarned: 0, // No points for just registration
    },
    {
      id: '2',
      userName: 'Sarah M.',
      registrationDate: new Date(new Date().getTime() - 5 * 60 * 1000),
      status: 'completed',
      pointsEarned: 50, // Points earned because user subscribed
    },
    {
      id: '3',
      userName: 'Alex K.',
      registrationDate: new Date(new Date().getTime() - 12 * 60 * 1000),
      status: 'registered',
      pointsEarned: 0, // No points for just registration
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Sarah M.',
      amount: 200,
      date: new Date(new Date().getTime() - 5 * 60 * 1000),
      status: 'completed',
      pointsEarned: 50,
    },
  ]);

  const [stats] = useState<ReferralStats>({
    totalReferrals: 1234,
    totalPoints: 3567,
    conversionRate: 32,
    growthRateReferrals: 12,
    growthRatePoints: 23,
    growthRateConversion: 5,
  });

  const copyReferralLink = (): void => {
    const link = generateReferralLink('123456');
    // Safe clipboard access
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link)
        .then(() => console.log('Referral link copied to clipboard'))
        .catch((err) => console.error('Could not copy referral link: ', err));
    }
  };

  const generateReferralLink = (userId: string): string => {
    return `https://optsage.com/ref/${userId}`;
  };

  const value = {
    referrals,
    transactions,
    stats,
    copyReferralLink,
    generateReferralLink,
  };

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}; 