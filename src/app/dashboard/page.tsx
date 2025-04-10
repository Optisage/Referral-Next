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
  nigeria: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    rate: 1 // Base currency
  },
  ghana: {
    code: 'GHS',
    symbol: '₵',
    name: 'Ghanaian Cedi',
    rate: 0.045 // 1 NGN = 0.045 GHS
  },
  kenya: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    rate: 0.75 // 1 NGN = 0.75 KES
  },
  'south-africa': {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    rate: 0.11 // 1 NGN = 0.11 ZAR
  }
};

// Function to get country from phone number
const getCountryFromPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return 'nigeria'; // Default
  
  // Simple country detection based on phone codes
  if (phoneNumber.startsWith('+234') || phoneNumber.startsWith('234')) {
    return 'nigeria';
  } else if (phoneNumber.startsWith('+233') || phoneNumber.startsWith('233')) {
    return 'ghana';
  } else if (phoneNumber.startsWith('+254') || phoneNumber.startsWith('254')) {
    return 'kenya';
  } else if (phoneNumber.startsWith('+27') || phoneNumber.startsWith('27')) {
    return 'south-africa';
  }
  
  return 'nigeria'; // Default fallback
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, setPageLoading } = useAuth();
  const { stats, referrals, copyReferralLink } = useReferral();
  const [copied, setCopied] = useState(false);
  
  // Get user's currency based on their WhatsApp number
  const userCountry = user ? getCountryFromPhoneNumber(user.whatsappNumber) : 'nigeria';
  const currency = CURRENCY_MAP[userCountry as keyof typeof CURRENCY_MAP];
  
  // Points to cash conversion
  const POINTS_TO_CASH_RATE = 100; // 1 point = ₦100 (base in Naira)
  const totalCashValueNGN = stats.totalPoints * POINTS_TO_CASH_RATE;
  const totalCashValue = totalCashValueNGN * currency.rate;
  
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
  
  if (loading || !user) {
    return <Preloader fullScreen state="dashboard" />;
  }
  
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerCard}>
        <h1 className={styles.dashboardTitle}>
          <FaChartLine className="mr-2 text-whatsapp-green" /> Admin Dashboard
        </h1>
      </div>
      
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {/* Total Referrals Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-whatsapp-light-green p-3 transform transition-transform group-hover:scale-110">
              <FaUsers className="h-6 w-6 text-whatsapp-dark-green" />
            </div>
            <div className="bg-green-50 text-green-600 font-semibold px-3 py-1 rounded-full flex items-center">
              <span className="text-xs mr-1">+</span>{stats.growthRateReferrals}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 font-medium">Total Referrals</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {stats.totalReferrals.toLocaleString()}
            </h2>
          </div>
        </div>
        
        {/* Total Points Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-whatsapp-light-green p-3">
              <FaStar className="h-6 w-6 text-whatsapp-dark-green" />
            </div>
            <div className="bg-green-50 text-green-600 font-semibold px-3 py-1 rounded-full flex items-center">
              <span className="text-xs mr-1">+</span>{stats.growthRatePoints}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 font-medium">Total Points</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {stats.totalPoints.toLocaleString()}
            </h2>
          </div>
        </div>
        
        {/* Conversion Rate Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-whatsapp-light-green p-3">
              <FaExchangeAlt className="h-6 w-6 text-whatsapp-dark-green" />
            </div>
            <div className="bg-green-50 text-green-600 font-semibold px-3 py-1 rounded-full flex items-center">
              <span className="text-xs mr-1">+</span>{stats.growthRateConversion}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 font-medium">Conversion Rate</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {stats.conversionRate}%
            </h2>
          </div>
        </div>
        
        {/* Total Amount Card */}
        <div className={styles.statCard}>
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-whatsapp-light-green p-3">
              <FaMoneyBillWave className="h-6 w-6 text-whatsapp-dark-green" />
            </div>
            <div className="bg-green-50 text-green-600 font-semibold px-3 py-1 rounded-full flex items-center">
              <span className="text-xs mr-1">+</span>{stats.growthRatePoints}% this month
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 font-medium">Total Amount ({currency.code})</p>
            <h2 className="text-4xl font-bold text-whatsapp-dark-green">
              {currency.symbol}{totalCashValue.toLocaleString(undefined, {maximumFractionDigits: 2})}
            </h2>
            <p className="text-xs text-gray-500 mt-1">1 point = {currency.symbol}{(POINTS_TO_CASH_RATE * currency.rate).toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {/* Referral Link Section */}
      <div className={styles.referralSection}>
        <h2 className={styles.sectionTitle}>
          <Image 
            src="/Optisage-Log0-white.svg" 
            alt="OptSage Logo" 
            width={24} 
            height={24}
            className="mr-2" 
          /> Your Referral Link
        </h2>
        <div className="flex items-center">
          <input 
            type="text" 
            value={user.referralLink || 'https://optsage.com/ref/123456'}
            className="flex-grow px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent bg-gray-50"
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
        <p className="text-sm text-gray-500 mt-3 bg-whatsapp-light-green/20 p-3 rounded-lg">
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
            <div key={referral.id} className="py-4 flex justify-between items-center hover:bg-gray-50 px-3 rounded-lg transition-colors">
              <div>
                <p className="font-medium flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  {referral.userName} {referral.status === 'registered' ? 'registered via your link' : 'made their first subscription'}
                </p>
                <p className="text-sm text-gray-500 ml-4">
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