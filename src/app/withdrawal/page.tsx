'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useReferral } from '@/context/ReferralContext';
import { FaMoneyBillWave, FaHistory, FaCheckCircle, FaExchangeAlt, FaStar, FaCalculator } from 'react-icons/fa';
import styles from './withdrawal.module.css';
import Preloader from '@/components/Preloader';

// Define currency data for different countries
const COUNTRY_CURRENCY_MAP = {
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

// Define a type for the country keys
type CountryKey = keyof typeof COUNTRY_CURRENCY_MAP;

// Define a type for the withdrawal history items
interface WithdrawalHistoryItem {
  id: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending';
  country: CountryKey;
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
  
  const [country, setCountry] = useState<CountryKey>('nigeria');
  const [amount, setAmount] = useState<string>('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank' | 'mobile'>('bank');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [mobileProvider, setMobileProvider] = useState<string>('');
  const [calculatorPoints, setCalculatorPoints] = useState<string>('');
  
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Get currency info based on selected country
  const currency = COUNTRY_CURRENCY_MAP[country];
  
  // Points to cash conversion
  const POINTS_TO_CASH_RATE = 100; // 1 point = ₦100 (base in Naira)
  const availablePoints = stats.totalPoints;
  
  // Calculate available balance based on country's currency
  const availableBalanceNGN = availablePoints * POINTS_TO_CASH_RATE;
  const availableBalance = availableBalanceNGN * currency.rate;
  
  // Calculate converted value for calculator
  const calculatedValue = calculatorPoints ? 
    parseFloat(calculatorPoints) * POINTS_TO_CASH_RATE * currency.rate : 0;
  
  // Convert min withdrawal amount to local currency
  const minWithdrawalAmount = 500 * currency.rate;
  
  // Mock withdrawal history
  const withdrawalHistory: WithdrawalHistoryItem[] = [
    { id: 'with-1', amount: 2500 * COUNTRY_CURRENCY_MAP['nigeria'].rate, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), status: 'completed', country: 'nigeria' },
    { id: 'with-2', amount: 1500 * COUNTRY_CURRENCY_MAP['ghana'].rate, date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), status: 'completed', country: 'ghana' },
    { id: 'with-3', amount: 500 * COUNTRY_CURRENCY_MAP['kenya'].rate, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'pending', country: 'kenya' },
  ];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value as CountryKey;
    setCountry(newCountry);
    
    // Reset amount when changing countries
    setAmount('');
    
    // Reset withdrawal method to bank if mobile is not supported in the selected country
    if (newCountry !== 'ghana' && newCountry !== 'kenya' && withdrawalMethod === 'mobile') {
      setWithdrawalMethod('bank');
    }
  };
  
  const handleWithdrawal = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate amount
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (withdrawalAmount > availableBalance) {
      setError('Insufficient balance');
      return;
    }
    
    if (withdrawalAmount < minWithdrawalAmount) {
      setError(`Minimum withdrawal is ${currency.symbol}${minWithdrawalAmount.toFixed(2)}`);
      return;
    }
    
    // Validate withdrawal method fields
    if (withdrawalMethod === 'bank') {
      if (!bankName || !accountNumber || !accountName) {
        setError('Please fill all bank account details');
        return;
      }
    } else if (withdrawalMethod === 'mobile') {
      if (!mobileNumber || !mobileProvider) {
        setError('Please fill all mobile money details');
        return;
      }
    }
    
    try {
      setSubmitting(true);
      // In a real app, this would make an API call to process the withdrawal
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setShowSuccess(false);
        setAmount('');
        setAccountNumber('');
        setAccountName('');
        setBankName('');
        setMobileNumber('');
        setMobileProvider('');
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Calculate points required based on amount and currency
  const calculatePointsNeeded = (amountValue: string | undefined): number => {
    if (!amountValue) return 0;
    // Convert local currency to NGN to calculate points
    const amountInNGN = parseFloat(amountValue) / currency.rate;
    return Math.ceil(amountInNGN / POINTS_TO_CASH_RATE);
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  if (loading || !user) {
    return <Preloader fullScreen state="withdrawal" />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Withdraw Funds</h1>
        <p className={styles.subtitle}>Convert your points to cash and withdraw</p>
      </div>
      
      {/* Success Message */}
      {showSuccess && (
        <div className={styles.successAlert} role="alert">
          <div className={styles.alertContent}>
            <FaCheckCircle className={styles.alertIcon} />
            <span>Your withdrawal request has been submitted successfully.</span>
          </div>
          <p className={styles.alertSubtext}>It will be processed within 24-48 hours.</p>
        </div>
      )}
      
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
              <span>1 point = {currency.symbol}{(POINTS_TO_CASH_RATE * currency.rate).toFixed(2)} {currency.code}</span>
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
                    value={country}
                    onChange={handleCountryChange}
                    className={styles.inputField}
                    required
                  >
                    <option value="nigeria">Nigeria ({COUNTRY_CURRENCY_MAP.nigeria.symbol} {COUNTRY_CURRENCY_MAP.nigeria.code})</option>
                    <option value="ghana">Ghana ({COUNTRY_CURRENCY_MAP.ghana.symbol} {COUNTRY_CURRENCY_MAP.ghana.code})</option>
                    <option value="kenya">Kenya ({COUNTRY_CURRENCY_MAP.kenya.symbol} {COUNTRY_CURRENCY_MAP.kenya.code})</option>
                    <option value="south-africa">South Africa ({COUNTRY_CURRENCY_MAP['south-africa'].symbol} {COUNTRY_CURRENCY_MAP['south-africa'].code})</option>
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
                
                {/* Withdrawal Method */}
                <div>
                  <label className={styles.label}>
                    Withdrawal Method
                  </label>
                  <div className={styles.flexSpaceX4}>
                    <div className={styles.flexItems}>
                      <input
                        id="bank"
                        type="radio"
                        name="withdrawalMethod"
                        value="bank"
                        checked={withdrawalMethod === 'bank'}
                        onChange={() => setWithdrawalMethod('bank')}
                        className={styles.h4}
                      />
                      <label htmlFor="bank" className={styles.ml2}>
                        Bank Transfer
                      </label>
                    </div>
                    {(country === 'ghana' || country === 'kenya') && (
                      <div className={styles.flexItems}>
                        <input
                          id="mobile"
                          type="radio"
                          name="withdrawalMethod"
                          value="mobile"
                          checked={withdrawalMethod === 'mobile'}
                          onChange={() => setWithdrawalMethod('mobile')}
                          className={styles.h4}
                        />
                        <label htmlFor="mobile" className={styles.ml2}>
                          Mobile Money
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bank Transfer Details */}
                {withdrawalMethod === 'bank' && (
                  <div className={styles.border}>
                    <div>
                      <label htmlFor="bankName" className={styles.label}>
                        Bank Name
                      </label>
                      <input
                        id="bankName"
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className={styles.inputField}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="accountNumber" className={styles.label}>
                        Account Number
                      </label>
                      <input
                        id="accountNumber"
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className={styles.inputField}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="accountName" className={styles.label}>
                        Account Name
                      </label>
                      <input
                        id="accountName"
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className={styles.inputField}
                        required
                      />
                    </div>
                  </div>
                )}
                
                {/* Mobile Money Details */}
                {withdrawalMethod === 'mobile' && (
                  <div className={styles.border}>
                    <div>
                      <label htmlFor="mobileProvider" className={styles.label}>
                        Mobile Provider
                      </label>
                      <select
                        id="mobileProvider"
                        value={mobileProvider}
                        onChange={(e) => setMobileProvider(e.target.value)}
                        className={styles.inputField}
                        required
                      >
                        <option value="">Select Provider</option>
                        {country === 'ghana' && (
                          <>
                            <option value="mtn">MTN</option>
                            <option value="vodafone">Vodafone</option>
                            <option value="airtel-tigo">AirtelTigo</option>
                          </>
                        )}
                        {country === 'kenya' && (
                          <>
                            <option value="mpesa">M-Pesa</option>
                            <option value="airtel">Airtel Money</option>
                          </>
                        )}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="mobileNumber" className={styles.label}>
                        Mobile Number
                      </label>
                      <input
                        id="mobileNumber"
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className={styles.inputField}
                        placeholder="Enter your mobile money number"
                        required
                      />
                    </div>
                  </div>
                )}
                
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
                  const currencyInfo = COUNTRY_CURRENCY_MAP[withdrawal.country];
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
                        <span className={styles.withdrawalCardLabel}>Status</span>
                        <span className={`${styles.px2} ${styles.inlineFlex} ${styles.textXs} ${styles.leading5} ${styles.fontSemibold} ${styles.roundedFull} ${
                          withdrawal.status === 'completed' ? styles.bgGreen100 : styles.bgYellow100
                        }`}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </span>
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className={styles.bgWhite}>
                  {withdrawalHistory.map((withdrawal) => {
                    const currencyInfo = COUNTRY_CURRENCY_MAP[withdrawal.country];
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
                          <span className={`${styles.px2} ${styles.inlineFlex} ${styles.textXs} ${styles.leading5} ${styles.fontSemibold} ${styles.roundedFull} ${
                            withdrawal.status === 'completed' ? styles.bgGreen100 : styles.bgYellow100
                          }`}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </span>
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