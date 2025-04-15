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
  const { analytics, activityFeed, isLoading, error, copyReferralLink } = useReferral();
  // Add state for notification visibility
const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [copied, setCopied] = useState(false);

  // Points conversion calculations
  const POINTS_TO_CASH_RATE = 100;
  const totalCashValue = analytics?.points_earned 
    ? (analytics.points_earned * POINTS_TO_CASH_RATE)
    : 0;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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
            <div className="flex items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs">+</span>
              {analytics?.total_referrals ?? 0}% this week
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
            <div className="flex items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs">+</span>
              {analytics?.points_earned ?? 0}% this week
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
            <div className="flex items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs">+</span>
              {analytics?.conversion_rate ?? 0}% trend
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
            <div className="flex items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs">+</span>
              {analytics?.total_amount ?? 0}th rank
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-500">Total Value (CAD)</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {CURRENCY_MAP.canada.symbol}
              {analytics?.total_amount}
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
     <div className={styles.activitySection}>
     <h2 className={styles.sectionTitle}>
       <FaUsers className="mr-2 text-whatsapp-green" /> Live Activity Feed
     </h2>
     <div className="divide-y">
       {activityFeed.map((referral) => (
         <div key={referral.id} className="flex items-center justify-between px-3 py-4 transition-colors rounded-lg hover:bg-gray-50">
           <div>
             <p className="flex items-center font-medium">
               <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>
               {referral.description} 
             </p>
             <p className="ml-4 text-sm text-gray-500">
             {dayjs(referral.created_at).fromNow()}
             </p>
           </div>
           <div className={`font-medium px-3 py-1 rounded-full text-sm ${
             referral.points === '0.00' 
               ? 'text-blue-700 bg-blue-50' 
               : 'text-green-700 bg-green-50'
           }`}>
             {referral.points === '0.00' ? '0 points' : `+${referral.points} points`}
           </div>
         </div>
       ))}
     </div>
   </div>
  ) : (
    <div className="p-4 mt-2 text-sm text-center text-gray-500 rounded-lg bg-gray-50">
      No recent activity to display.
    </div>
  )}
</div>
    </div>
  );
}