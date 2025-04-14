'use client';

import { useEffect, useState, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useReferral } from '@/context/ReferralContext';
import { FaMoneyBillWave, FaHistory, FaCheckCircle, FaExchangeAlt, FaStar, FaCalculator } from 'react-icons/fa';
import styles from './withdrawal.module.css';
import Preloader from '@/components/Preloader';
import SlideNotification from '@/components/SlideNotification';

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

// Define a type for the country keys
type CountryKey = keyof typeof CURRENCY_MAP;

// Define a type for the withdrawal history items
interface WithdrawalHistoryItem {
  id: string;
  amount: number;
  date: Date;
  paymentMethod: 'Bank Transfer' | 'Mobile Money' | 'Interac e-Transfer';
  country: CountryKey;
  reference: string;
}

export default function Withdrawal() {
  const router = useRouter();
  const { user, loading, setPageLoading } = useAuth();
  const { stats } = useReferral();
  
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
  
  // All users are from Canada
  const userCountry = 'canada';
  const currency = CURRENCY_MAP.canada;
  
  // Payment method state - only Interac e-Transfer is available for Canada
  const [paymentMethod, setPaymentMethod] = useState<'interac_etransfer'>('interac_etransfer');
  
  // Interac e-Transfer details
  const [email, setEmail] = useState('');
  
  const [amount, setAmount] = useState<string>('');
  const [calculatorPoints, setCalculatorPoints] = useState<string>('');
  
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Points to cash conversion
  const POINTS_TO_CASH_RATE = 100; // 1 point = C$100 (base in CAD)
  const availablePoints = stats.totalPoints;
  
  // Calculate available balance directly in CAD
  const availableBalance = availablePoints * POINTS_TO_CASH_RATE;
  
  // Calculate converted value for calculator
  const calculatedValue = calculatorPoints ? 
    parseFloat(calculatorPoints) * POINTS_TO_CASH_RATE : 0;
  
  // Min withdrawal amount in CAD
  const minWithdrawalAmount = 500;
  
  // Mock withdrawal history with only Canadian transactions using Interac
  const withdrawalHistory = useMemo<WithdrawalHistoryItem[]>(() => [
    { 
      id: 'with-1', 
      amount: 2500, 
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), 
      paymentMethod: 'Interac e-Transfer', 
      country: 'canada',
      reference: 'REF8453291'
    },
    { 
      id: 'with-2', 
      amount: 1500, 
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), 
      paymentMethod: 'Interac e-Transfer', 
      country: 'canada',
      reference: 'REF7125834'
    },
    { 
      id: 'with-3', 
      amount: 1000, 
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
      paymentMethod: 'Interac e-Transfer', 
      country: 'canada',
      reference: 'REF5247896'
    }
  ], []);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value as CountryKey;
    // Reset amount when changing countries
    setAmount('');
  };
  
  // Add validation functions
  const isNumeric = (value: string): boolean => {
    return /^\d+$/.test(value);
  };

  const handleWithdrawal = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      // Validate amount
      if (!amount) {
        setError('Please enter a withdrawal amount');
        return;
      }
      
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Please enter a valid withdrawal amount');
        return;
      }
      
      if (parsedAmount < minWithdrawalAmount) {
        setError(`Minimum withdrawal amount is ${currency.symbol}${minWithdrawalAmount.toLocaleString()}`);
        return;
      }
      
      if (parsedAmount > availableBalance) {
        setError(`Withdrawal amount exceeds your available balance of ${currency.symbol}${availableBalance.toLocaleString()}`);
        return;
      }
      
      // Validate based on withdrawal method
      if (paymentMethod === 'interac_etransfer') {
        // Validate email format for Interac
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setError('Please enter a valid email address for Interac e-Transfer');
          return;
        }
      }
      
      // Run full validation
      if (!validateWithdrawalDetails()) {
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      setNotificationMessage(`Withdrawal of ${currency.symbol}${parsedAmount.toLocaleString()} has been initiated via Interac e-Transfer. Please check your email at ${email} for the transfer.`);
      setNotificationType('success');
      setShowNotification(true);
      
      // Reset form
      setAmount('');
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Calculate points required based on amount
  const calculatePointsNeeded = (amountValue: string | undefined): number => {
    if (!amountValue) return 0;
    // Direct conversion in CAD
    const amountInCAD = parseFloat(amountValue);
    return Math.ceil(amountInCAD / POINTS_TO_CASH_RATE);
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Close notification handler
  const handleCloseNotification = () => {
    setShowNotification(false);
  };
  
  // Render payment method form based on selected method
  const renderPaymentMethodForm = () => {
    return (
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address for Interac e-Transfer</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your email address"
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            We'll send your funds to this email address via Interac e-Transfer
          </p>
        </div>
      </div>
    );
  };
  
  // Validate withdrawal details
  const validateWithdrawalDetails = () => {
    let isValid = true;
    const errors: string[] = [];

    if (!amount || parseFloat(amount) <= 0) {
      errors.push('Please enter a valid withdrawal amount');
      isValid = false;
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount > availableBalance) {
      errors.push(`Withdrawal amount exceeds your available balance of ${currency.symbol}${availableBalance.toLocaleString()}`);
      isValid = false;
    }

    // Validate Interac e-Transfer details
    if (!email.trim()) {
      errors.push('Email address is required for Interac e-Transfer');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address');
      isValid = false;
    }

    setError(errors.length > 0 ? errors.join('\n') : '');
    return isValid;
  };
  
  // Define notification message states
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  
  if (loading || !user) {
    return <Preloader fullScreen state="withdrawal" />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Withdraw Funds</h1>
        <p className={styles.subtitle}>Convert your points to cash and withdraw</p>
      </div>
      
      {/* Slide Notification */}
      <SlideNotification
        show={showNotification}
        message={notificationMessage || `Withdrawal of ${currency.symbol}${parseFloat(amount || '0').toLocaleString()} has been processed successfully.`}
        type={notificationType}
        duration={5000}
        onClose={() => setShowNotification(false)}
      />
      
      {/* Error Message */}
      {error && (
        <div className={styles.errorAlert} role="alert">
          <span>{error}</span>
        </div>
      )}
      
      {/* Show preloader overlay when submitting withdrawal */}
      {submitting && <Preloader fullScreen state="withdrawal_process" />}
      
      <div className={styles.contentGrid}>
        {/* Points & Balance Cards */}
        <div className={styles.sideCards}>
          {/* Points Card */}
          <div className={styles.pointsCard}>
            <div className={styles.cardHeader}>
              <FaStar className={styles.headerIcon} />
              <h2 className={styles.headerTitle}>Available Points</h2>
            </div>
            <div className={styles.text4xl}>{availablePoints.toLocaleString()}</div>
            <div className={styles.flexItems}>
              <FaExchangeAlt className={styles.icon} />
              <span>1 point = {currency.symbol}{POINTS_TO_CASH_RATE.toFixed(2)} {currency.code}</span>
            </div>
          </div>
          
          {/* Cash Value Card */}
          <div className={styles.cashCard}>
            <div className={styles.cardHeader}>
              <FaMoneyBillWave className={styles.headerIcon} />
              <h2 className={styles.headerTitle}>Cash Value ({currency.code})</h2>
            </div>
            <div className={styles.text4xl}>{currency.symbol}{availableBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
            <p className={styles.opacity75}>Available for withdrawal</p>
          </div>
          
          {/* Points Calculator */}
          <div className={styles.calculatorCard}>
            <div className={styles.cardHeader}>
              <FaCalculator className={styles.headerIcon} />
              <h2 className={styles.headerTitle}>Points Calculator</h2>
            </div>
            <div className={styles.spacey4}>
              <div>
                <label htmlFor="pointsToCalculate" className={styles.label}>
                  Enter Points
                </label>
                <div className={styles.flexItems}>
                  <input
                    id="pointsToCalculate"
                    type="number"
                    className={styles.inputField}
                    placeholder="Enter points to convert"
                    value={calculatorPoints}
                    onChange={(e) => setCalculatorPoints(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.bgGray50}>
                <div className={styles.flexJustifyBetween}>
                  <span>Points Value:</span>
                  <span>{currency.symbol}{calculatedValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
                <div className={styles.flexJustifyBetween}>
                  <span className={styles.textGray800}>Cash in {currency.code}:</span>
                  <span className={styles.textWhatappDarkGreen}>{currency.symbol}{calculatedValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Withdrawal Form */}
        <div className={styles.formCard}>
          <div className={styles.card}>
            <h2 className={styles.textXl}>Request Withdrawal</h2>
            
            <form onSubmit={handleWithdrawal}>
              <div className={styles.spacey4}>
                {/* Country Selection */}
                <div>
                  <label className={styles.label}>
                    Country & Currency
                  </label>
                  <select
                    value={userCountry}
                    onChange={handleCountryChange}
                    className={styles.inputField}
                    required
                  >
                    <option value="canada">Canada ({CURRENCY_MAP.canada.symbol} {CURRENCY_MAP.canada.code})</option>
                  </select>
                </div>
                
                {/* Amount */}
                <div>
                  <label htmlFor="amount" className={styles.label}>
                    Amount ({currency.symbol})
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={styles.inputField}
                    placeholder={`Enter amount to withdraw in ${currency.code}`}
                    min={minWithdrawalAmount.toString()}
                    max={availableBalance.toString()}
                    step="0.01"
                    required
                  />
                  <div className={styles.flexJustifyBetween}>
                    <span>Minimum withdrawal: {currency.symbol}{minWithdrawalAmount.toFixed(2)}</span>
                    <span>Points needed: {calculatePointsNeeded(amount)}</span>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                  <p className="text-sm text-gray-500">Interac e-Transfer is the only available method for withdrawals in Canada.</p>
                  
                  <div className="mt-4">
                    <div className="flex items-center">
                      <input
                        id="interac_etransfer"
                        name="payment_method"
                        type="radio"
                        checked={paymentMethod === 'interac_etransfer'}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        readOnly
                      />
                      <label htmlFor="interac_etransfer" className="ml-3 block text-sm font-medium text-gray-700">
                        Interac e-Transfer ({currency.code})
                      </label>
                    </div>
                  </div>
                  
                  {renderPaymentMethodForm()}
                </div>
                
                <div>
                  <button type="submit" className={styles.btnPrimary}>
                    Submit Withdrawal Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* History */}
        <div className={styles.historyCard}>
          <div className={`${styles.flexItems} ${styles.cardHeader}`}>
            <FaHistory className={styles.h5} />
            <h2 className={styles.textXl}>Withdrawal History</h2>
          </div>
          
          <div className={styles.card}>
            <div className={styles.overflowHidden}>
              {/* Mobile Card View */}
              <div className={styles.withdrawalMobileCards}>
                {withdrawalHistory.map((withdrawal) => {
                  const currencyInfo = CURRENCY_MAP[withdrawal.country];
                  return (
                    <div key={withdrawal.id} className={styles.withdrawalCard}>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>ID</span>
                        <span className={styles.withdrawalCardValue}>{withdrawal.id}</span>
                      </div>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>Amount</span>
                        <span className={styles.withdrawalCardValue}>
                          {currencyInfo.symbol}{withdrawal.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </span>
                      </div>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>Date</span>
                        <span className={styles.withdrawalCardValue}>{formatDate(withdrawal.date)}</span>
                      </div>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>Payment Method</span>
                        <span className={styles.withdrawalCardValue}>{withdrawal.paymentMethod}</span>
                      </div>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>Reference</span>
                        <span className={styles.withdrawalCardValue}>{withdrawal.reference}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <table className={styles.withdrawalMobileTable}>
                <thead className={styles.bgGray50}>
                  <tr>
                    <th scope="col">
                      ID
                    </th>
                    <th scope="col">
                      Amount
                    </th>
                    <th scope="col">
                      Date
                    </th>
                    <th scope="col">
                      Payment Method
                    </th>
                    <th scope="col">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className={styles.bgWhite}>
                  {withdrawalHistory.map((withdrawal) => {
                    const currencyInfo = CURRENCY_MAP[withdrawal.country];
                    return (
                      <tr key={withdrawal.id}>
                        <td className={styles.px6}>
                          {withdrawal.id}
                        </td>
                        <td className={styles.px6}>
                          {currencyInfo.symbol}{withdrawal.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </td>
                        <td className={styles.px6}>
                          {formatDate(withdrawal.date)}
                        </td>
                        <td className={styles.px6}>
                          {withdrawal.paymentMethod}
                        </td>
                        <td className={styles.px6}>
                          {withdrawal.reference}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 