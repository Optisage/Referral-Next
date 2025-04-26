'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import apiClient from '@/lib/axios';


// Add to interfaces section
interface ReferralTransaction {
  id: number;
  user_id: number;
  referred_id: number;
  points: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  user: string;
  referred: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    // Include other fields as needed
  };
}

interface ReferralTransactionsResponse {
  current_page: number;
  data: ReferralTransaction[];
  total: number;
  last_page: number;
}

interface WithdrawalRequest {
  id: number;
  user_id: number;
  amount: string;
  point: string;
  currency: string;
  status: number; // 0 = pending, 1 = approved, 2 = rejected
  withdrawal_method: string;
  bank_name?: string;
  account_name: string;
  account_number?: string;
  sort_code?: string;
  reference?: string;
  meta_data: any[];
  created_at: string;
  updated_at: string;
}



interface ReferralAnalytics {
  total_referrals: number;
  points_earned: number;
  conversion_rate: number;
  total_amount: number;
  total_referrals_month_growth: number;
  points_earned_month_growth: number;
  conversion_rate_month_growth: number;
  total_amount_month_growth: number;
}

interface ActivityFeedItem {
  id: number;
  user_id: number;
  description: string;
  points: string;
  created_at: string;
  updated_at: string;
  meta_data: any[];
}

interface PaginationState {
  currentPage: number;
  lastPage: number;
  total: number;
}

interface ReferralContextType {
  analytics: ReferralAnalytics | null;
  activityFeed: ActivityFeedItem[];
  isLoading: boolean;
  error: string | null;
  withdrawalHistory: WithdrawalRequest[];
  fetchWithdrawalHistory: () => Promise<void>;
  requestWithdrawal: (
    data: {
      currency: string;
      amount: number;
      point: number;
      withdrawal_method: string;
      bank_name: string;
      email: string;
      account_name: string;
    }
  ) => Promise<void>;
  copyReferralLink: (userId: string) => void;
  generateReferralLink: (userId: string) => string;
  refreshAnalytics: () => Promise<void>;
  refreshActivityFeed: (page?: number) => Promise<void>;
  transactions: ReferralTransaction[];
  pagination: PaginationState;
  fetchTransactions: (page?: number) => Promise<void>;
  activityPagination: PaginationState;

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
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [activityPagination, setActivityPagination] = useState<PaginationState>({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Add fetchTransactions function
  const fetchTransactions = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/referral-system/transactions?page=${page}`);
      const responseData = response.data;
      
      setTransactions(responseData.data);
      setPagination({
        currentPage: responseData.current_page,
        lastPage: responseData.last_page,
        total: responseData.total
      });
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Transactions Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Withdrawal API calls
  const fetchWithdrawalHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/referral-system/withdrawal-requests');
      setWithdrawalHistory(response.data.data);
    } catch (err) {
      setError('Failed to load withdrawal history');
      console.error('Withdrawal History Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestWithdrawal = useCallback(async (data: {
    currency: string;
    amount: number;
    point: number;
    withdrawal_method: string;
    bank_name: string;
    email: string;
    account_name: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post('/referral-system/withdrawal-requests', data);
      setWithdrawalHistory(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError('Withdrawal request failed');
      console.error('Withdrawal Error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);


  //Fetch analytics API Call
  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/referral-system/dashboard/analytics');
      const data = response.data;
  
      if (Array.isArray(data)) {
        const analyticsData: ReferralAnalytics = {
          total_referrals: data.find(item => item.metric === 'total referrals')?.value || 0,
          total_referrals_month_growth: data.find(item => item.metric === 'total referrals')?.month_growth || 0,
          
          points_earned: data.find(item => item.metric === 'total points')?.value || 0,
          points_earned_month_growth: data.find(item => item.metric === 'total points')?.month_growth || 0,
          
          conversion_rate: data.find(item => item.metric === 'conversion rate')?.value || 0,
          conversion_rate_month_growth: data.find(item => item.metric === 'conversion rate')?.month_growth || 0,
          
          total_amount: Number(data.find(item => item.metric === 'total amount')?.value || 0),
          total_amount_month_growth: data.find(item => item.metric === 'total amount')?.month_growth || 0,
        };
  
        setAnalytics(analyticsData);
      } else {
        throw new Error('Invalid analytics data format');
      }
    } catch (err) {
      setError('Failed to load referral analytics');
      console.error('Analytics Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  



  const fetchActivityFeed = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/referral-system/dashboard/activity-feeds?page=${page}`);
      const rawActivities = response?.data?.data || [];
      
      setActivityPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total
      });

      const mappedActivities: ActivityFeedItem[] = rawActivities.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        description: item.description,
        points: item.points,
        created_at: item.created_at,
        updated_at: item.updated_at,
        meta_data: item.meta_data
      }));

      setActivityFeed(mappedActivities);
    } catch (err) {
      setError('Failed to load activity feed');
      console.error('Activity Feed Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  



  const copyReferralLink = useCallback((userId: string): void => {
    const link = `https://optisage.ai/pricing?ref=${userId}`;
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link)
        .then(() => console.log('Referral link copied'))
        .catch((err) => console.error('Copy failed:', err));
    }
  }, []);

  const generateReferralLink = useCallback((userId: string): string => {
    return `https://optisage.ai/pricing?ref=${userId}`;
  }, []);

  const value = useMemo(() => ({
    analytics,
    activityFeed,
    isLoading,
    error,
    withdrawalHistory,
    copyReferralLink,
    generateReferralLink,
    refreshAnalytics: fetchAnalytics,
    refreshActivityFeed: fetchActivityFeed,
    fetchWithdrawalHistory,
    requestWithdrawal,
    transactions,
    pagination,
    fetchTransactions,
    activityPagination,
  }), [analytics, activityFeed, isLoading, error, fetchAnalytics, fetchActivityFeed,fetchWithdrawalHistory,requestWithdrawal, transactions,  pagination, fetchTransactions,activityPagination]);

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
};