'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useReferral } from '@/context/ReferralContext';
import { FaUsers, FaDollarSign, FaExchangeAlt, FaCopy, FaCheckCircle, FaWhatsapp, FaChartLine, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import styles from './dashboard.module.css';
import Preloader from '@/components/Preloader';

// Define currency data for different countries
const CURRENCY_MAP = {
  canada: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    rate: 1 // Base currency
  }
};

// Function to get country from phone number - always returns 'canada'
const getCountryFromPhoneNumber = (phoneNumber: string): string => {
  return 'canada'; // All users are from Canada
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, setPageLoading } = useAuth();
  const { stats, referrals, copyReferralLink, isLoading } = useReferral();
  const [copied, setCopied] = useState(false);
  
  // All users are from Canada
  const userCountry = 'canada';
  const currency = CURRENCY_MAP.canada;
  
  // Points to cash conversion - use totalAmount from API if available
  const POINTS_TO_CASH_RATE = 100; // 1 point = C$100 (base in CAD)
  const totalCashValue = stats.totalAmount || (stats.totalPoints * POINTS_TO_CASH_RATE);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Signal page has loaded
  useEffect(() => {
    // Set page loading false when component mounts
    setPageLoading(false);
    
    // Signal page is loading on unmount (when navigating away)
    return () => {
      setPageLoading(true);
    };
  }, [setPageLoading]);
  
  const handleCopyLink = () => {
    copyReferralLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (loading || !user || isLoading) {
    return <Preloader fullScreen state="dashboard" />;
  }
  
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerCard}>
        <h1 className={styles.dashboardTitle}>
          <FaChartLine className="mr-2 text-whatsapp-green" /> Admin Dashboard
        </h1>
        <div className="flex items-center mt-2">
          <FaWhatsapp className="mr-2 text-whatsapp-green" />
          <p className="text-gray-600">
            <span className="font-semibold">WhatsApp Group Name:</span> {user.whatsappChannelName}
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {/* Total Referrals Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="p-3 transition-transform transform rounded-full bg-whatsapp-light-green group-hover:scale-110">
              <FaUsers className="w-6 h-6 text-whatsapp-dark-green" />
            </div>
            <div className="flex items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs">+</span>{stats.growthRateReferrals}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-500">Total Referrals</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {stats.totalReferrals.toLocaleString()}
            </h2>
          </div>
        </div>
        
        {/* Total Points Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-full bg-whatsapp-light-green">
              <FaStar className="w-6 h-6 text-whatsapp-dark-green" />
            </div>
            <div className="flex items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs">+</span>{stats.growthRatePoints}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-500">Total Points</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {stats.totalPoints.toLocaleString()}
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
              <span className="mr-1 text-xs">+</span>{stats.growthRateConversion}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-500">Conversion Rate</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {stats.conversionRate}%
            </h2>
          </div>
        </div>
        
        {/* Total Amount Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-full bg-whatsapp-light-green">
              <FaMoneyBillWave className="w-6 h-6 text-whatsapp-dark-green" />
            </div>
            <div className="flex items-center px-3 py-1 font-semibold text-green-600 rounded-full bg-green-50">
              <span className="mr-1 text-xs">+</span>{stats.growthRatePoints}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="font-medium text-gray-500">Total Amount ({currency.code})</p>
            <p className="font-medium text-gray-500">Total Amount (CAD)</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {currency.symbol}{totalCashValue.toLocaleString(undefined, {maximumFractionDigits: 2})}
            </h2>
            <p className="mt-1 text-xs text-gray-500">1 point = {currency.symbol}{(POINTS_TO_CASH_RATE * currency.rate).toFixed(2)}</p>
            <p className="mt-1 text-xs text-gray-500">1 point = {currency.symbol}{POINTS_TO_CASH_RATE.toFixed(2)} CAD</p>
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
            value={user.referralLink || 'https://optsage.com/ref/123456'}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent bg-gray-50"
            value={user.referralLink || 'https://optisage.com/ref/123456'}
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
      
      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h2 className={styles.sectionTitle}>
          <FaUsers className="mr-2 text-whatsapp-green" /> Live Activity Feed
        </h2>
        <div className="divide-y">
          {referrals.map((referral) => (
            <div key={referral.id} className="flex items-center justify-between px-3 py-4 transition-colors rounded-lg hover:bg-gray-50">
              <div>
                <p className="flex items-center font-medium">
                  <span className="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>
                  {referral.userName} {referral.status === 'registered' ? 'registered via your link' : 'made their first subscription'}
                </p>
                <p className="ml-4 text-sm text-gray-500">
                  {Math.floor((new Date().getTime() - referral.registrationDate.getTime()) / 60000)} minutes ago
                </p>
              </div>
              <div className={`font-medium px-3 py-1 rounded-full text-sm ${
                referral.status === 'registered' 
                  ? 'text-blue-700 bg-blue-50' 
                  : 'text-green-700 bg-green-50'
              }`}>
                {referral.status === 'registered' ? '0 points' : `+${referral.pointsEarned} points`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 