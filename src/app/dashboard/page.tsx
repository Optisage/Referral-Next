'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useReferral } from '@/context/ReferralContext';
import { FaUsers, FaDollarSign, FaExchangeAlt, FaCopy, FaCheckCircle, FaWhatsapp, FaChartLine, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import styles from './dashboard.module.css';
import Preloader from '@/components/Preloader';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import SlideNotification from '@/components/SlideNotification';


dayjs.extend(relativeTime);
const CURRENCY_MAP = {
  canada: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    rate: 1
  }
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, setPageLoading } = useAuth();
  const { analytics, activityFeed, isLoading, error, copyReferralLink,refreshAnalytics, refreshActivityFeed, activityPagination, } = useReferral();
  // Add state for notification visibility
const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentActivityPage, setCurrentActivityPage] = useState(1);

  useEffect(() => {
    const refreshData = async () => {
      try {
        await Promise.all([
          refreshAnalytics(), 
          refreshActivityFeed(currentActivityPage) // Pass current page
        ]);
      } catch (error) {
        console.error('Failed to refresh dashboard data:', error);
      }
    };
    refreshData();
  }, [refreshAnalytics, refreshActivityFeed, currentActivityPage]);

  // Pagination handlers
  const handleActivityPreviousPage = () => {
    if (currentActivityPage > 1) {
      setCurrentActivityPage(prev => prev - 1);
    }
  };

  const handleActivityNextPage = () => {
    if (currentActivityPage < activityPagination.lastPage) {
      setCurrentActivityPage(prev => prev + 1);
    }
  };

  // Points conversion calculations
  const POINTS_TO_CASH_RATE = 100;
  const totalCashValue = analytics?.points_earned 
    ? (analytics.points_earned / POINTS_TO_CASH_RATE)
    : 0;
    
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);


  useEffect(() => {
    const refreshData = async () => {
      try {
        await Promise.all([refreshAnalytics(), refreshActivityFeed()]);
      } catch (error) {
        console.error('Failed to refresh dashboard data:', error);
      }
    };
    
    refreshData();
  }, [refreshAnalytics, refreshActivityFeed]);
  
  useEffect(() => {
    setPageLoading(false);
    return () => setPageLoading(true);
  }, [setPageLoading]);

  const handleCopyLink = () => {
    if (user?.username) {
      copyReferralLink(user.username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
   // Add useEffect to handle error changes
useEffect(() => {
  if (error) {
    setShowErrorNotification(true);
    const timer = setTimeout(() => setShowErrorNotification(false), 5000);
    return () => clearTimeout(timer);
  }
}, [error]);

  if (loading || !user || isLoading) {
    return <Preloader fullScreen state="dashboard" />;
  }

 


  return (
    <div className={styles.dashboardContainer}>
     
{showErrorNotification && (
  <SlideNotification
    show={showErrorNotification}
    message={error || ''}
    type="error"
    duration={5000}
    onClose={() => setShowErrorNotification(false)}
  />
)}
      <div className={styles.headerCard}>
        <h1 className={styles.dashboardTitle}>
          <FaChartLine className="mr-2 text-whatsapp-green" /> Admin Dashboard
        </h1>
        <div className="flex items-center mt-2">
          <FaWhatsapp className="mr-2 text-whatsapp-green" />
          <p className="text-gray-600">
            <span className="font-semibold">WhatsApp Group Name:</span> {user.group_name}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Total Referrals Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="p-3 transition-transform transform rounded-full bg-whatsapp-light-green group-hover:scale-110">
              <FaUsers className="w-6 h-6 text-whatsapp-dark-green" />
            </div>
            <div className="items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs"></span>
              {analytics?.total_referrals_month_growth ?? 0}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-500">Total Referrals</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {analytics?.total_referrals?.toLocaleString() ?? 0}
            </h2>
          </div>
        </div>

        {/* Points Earned Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-full bg-whatsapp-light-green">
              <FaStar className="w-6 h-6 text-whatsapp-dark-green" />
            </div>
            <div className="items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs"></span>
              {analytics?.points_earned_month_growth ?? 0}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-500">Points Earned</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {analytics?.points_earned?.toLocaleString() ?? 0}
            </h2>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-full bg-whatsapp-light-green">
              <FaExchangeAlt className="w-6 h-6 text-whatsapp-dark-green" />
            </div>
            <div className="items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs"></span>
              {analytics?.conversion_rate_month_growth ?? 0}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-500">Conversion Rate</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {analytics?.conversion_rate ?? 0}%
            </h2>
          </div>
        </div>

        {/* Total Cash Value Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-full bg-whatsapp-light-green">
              <FaMoneyBillWave className="w-6 h-6 text-whatsapp-dark-green" />
            </div>
            <div className="items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs"></span>
              {analytics?.total_amount_month_growth ?? 0}this month
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-500">Total Value (CAD)</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
            {CURRENCY_MAP.canada.symbol}
            {totalCashValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className={styles.referralSection}>
        <h2 className={styles.sectionTitle}>
          <Image 
            src="/Optisage-Log0-white.svg" 
            alt="optisage Logo" 
            width={24} 
            height={24}
            className="mr-2" 
          /> Your Referral Link
        </h2>
        <div className="flex items-center">
          <input 
            type="text" 
            value={`https://optisage.ai/pricing?ref=${user.username}`}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent bg-gray-50"
            readOnly
          />
          <button 
            className={`px-4 py-3 flex items-center rounded-r-lg font-medium transition-all ${
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-whatsapp-green text-white hover:bg-whatsapp-dark-green'
            }`}
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <FaCheckCircle className="mr-2" /> Copied!
              </>
            ) : (
              <>
                <FaCopy className="mr-2" /> Copy
              </>
            )}
          </button>
        </div>
        <p className="p-3 mt-3 text-sm text-gray-500 rounded-lg bg-whatsapp-light-green/20">
          Share this link with your WhatsApp group members to earn rewards when they sign up and complete transactions.
        </p>
      </div>

      {/* Activity Feed */}
      <div className={styles.activitySection}>
  <h2 className={styles.sectionTitle}>
    <FaUsers className="mr-2 text-whatsapp-green" /> Recent Activity
  </h2>
  <p className="mb-4 text-sm text-gray-500">
    Stay up to date with your latest referrals and point earnings.
  </p>

  {activityFeed?.length > 0 ? (
      <div className="divide-y">
      {activityFeed.map((referral) => (
        <div key={referral.id} className="flex flex-col items-start justify-between px-2 py-3 transition-colors rounded-lg sm:flex-row sm:items-center sm:px-3 hover:bg-gray-50">
          <div className="w-full">
            <p className="flex items-center text-sm sm:text-base">
              <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>
              {referral.description}
            </p>
            <p className="ml-4 text-xs text-gray-500 sm:text-sm">
              {dayjs(referral.created_at).fromNow()}
            </p>
          </div>
          <div className={` w-[150px] !h-fit mt-2 sm:mt-0 font-medium px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm ${
            referral.points === '0.00' 
              ? 'text-blue-700 bg-blue-50' 
              : 'text-green-700 bg-green-50'
          }`}>
            {referral.points === '0.00' ? '0 points' : `+${referral.points} points`}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="p-4 mt-2 text-sm text-center text-gray-500 rounded-lg bg-gray-50">
      No recent activity to display.
    </div>
  )}


{activityFeed?.length > 0 && (
          <div className={styles.paginationContainer}>
            <button
              className={styles.paginationButton}
              onClick={handleActivityPreviousPage}
              disabled={currentActivityPage === 1 || isLoading}
            >
              Previous
            </button>
            <span className={styles.pageNumber}>
              Page {currentActivityPage} of {activityPagination.lastPage}
            </span>
            <button
              className={styles.paginationButton}
              onClick={handleActivityNextPage}
              disabled={currentActivityPage >= activityPagination.lastPage || isLoading}
            >
              Next
            </button>
          </div>
        )}
</div>
    </div>
  );
}