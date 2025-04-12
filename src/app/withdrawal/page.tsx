'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useReferral } from '@/context/ReferralContext';
import { FaMoneyBillWave, FaHistory, FaCheckCircle, FaExchangeAlt, FaStar, FaCalculator } from 'react-icons/fa';
import styles from './withdrawal.module.css';
import Preloader from '@/components/Preloader';
import SlideNotification from '@/components/SlideNotification';

// Define currency data for different countries
const COUNTRY_CURRENCY_MAP = {
  usa: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 0.0007 // Conversion rate from base currency
  },
  canada: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    rate: 0.00095 // Conversion rate from base currency
  },
  mexico: {
    code: 'MXN',
    symbol: 'MX$',
    name: 'Mexican Peso',
    rate: 0.012 // Conversion rate from base currency
  }
};

// Define a type for the country keys
type CountryKey = keyof typeof COUNTRY_CURRENCY_MAP;

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
  
  const [country, setCountry] = useState<CountryKey>('usa');
  const [amount, setAmount] = useState<string>('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank' | 'interac'>('bank');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [sortCode, setSortCode] = useState<string>('');
  const [calculatorPoints, setCalculatorPoints] = useState<string>('');
  const [interacEmail, setInteracEmail] = useState<string>('');
  
  const [showNotification, setShowNotification] = useState<boolean>(false);
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
    { 
      id: 'with-1', 
      amount: 2500 * COUNTRY_CURRENCY_MAP['usa'].rate, 
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), 
      paymentMethod: 'Bank Transfer', 
      country: 'usa',
      reference: 'REF8453291'
    },
    { 
      id: 'with-2', 
      amount: 1500 * COUNTRY_CURRENCY_MAP['canada'].rate, 
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), 
      paymentMethod: 'Bank Transfer', 
      country: 'canada',
      reference: 'REF7125834'
    },
    { 
      id: 'with-3', 
      amount: 500 * COUNTRY_CURRENCY_MAP['mexico'].rate, 
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 
      paymentMethod: 'Bank Transfer', 
      country: 'mexico',
      reference: 'REF9273461'
    },
    { 
      id: 'with-4', 
      amount: 1000 * COUNTRY_CURRENCY_MAP['canada'].rate, 
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
      paymentMethod: 'Interac e-Transfer', 
      country: 'canada',
      reference: 'REF5247896'
    },
  ];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value as CountryKey;
    setCountry(newCountry);
    
    // Reset amount when changing countries
    setAmount('');
  };
  
  // Add validation functions
  const isNumeric = (value: string): boolean => {
    return /^\d+$/.test(value);
  };

  const handleSortCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers in sort code field
    if (value === '' || isNumeric(value)) {
      setSortCode(value);
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers in account number field
    if (value === '' || isNumeric(value)) {
      setAccountNumber(value);
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
    
    // Validate based on withdrawal method
    if (withdrawalMethod === 'bank') {
      // Validate sort code and account number are numeric
      if (!isNumeric(sortCode)) {
        setError('Sort code must contain only numbers');
        return;
      }
      
      if (!isNumeric(accountNumber)) {
        setError('Account number must contain only numbers');
        return;
      }
      
      // Validate withdrawal method fields
      if (!bankName || !accountNumber || !accountName || !sortCode) {
        setError('Please fill all bank account details');
        return;
      }
    } else if (withdrawalMethod === 'interac') {
      // Validate email format for Interac
      if (!interacEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interacEmail)) {
        setError('Please enter a valid email address for Interac transfer');
        return;
      }
    }
    
    try {
      setSubmitting(true);
      // In a real app, this would make an API call to process the withdrawal
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show slide notification instead of alert
      setShowNotification(true);
      
      // Reset form
      setAmount('');
      setAccountNumber('');
      setAccountName('');
      setBankName('');
      setSortCode('');
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
  
  // Close notification handler
  const handleCloseNotification = () => {
    setShowNotification(false);
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
      
      {/* Slide Notification */}
      <SlideNotification
        show={showNotification}
        message="Withdrawal Request Sent Successfully"
        type="success"
        duration={5000}
        onClose={handleCloseNotification}
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
                    <option value="usa">USA ({COUNTRY_CURRENCY_MAP.usa.symbol} {COUNTRY_CURRENCY_MAP.usa.code})</option>
                    <option value="canada">Canada ({COUNTRY_CURRENCY_MAP.canada.symbol} {COUNTRY_CURRENCY_MAP.canada.code})</option>
                    <option value="mexico">Mexico ({COUNTRY_CURRENCY_MAP.mexico.symbol} {COUNTRY_CURRENCY_MAP.mexico.code})</option>
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
                    
                    {country === 'canada' && (
                      <div className={styles.flexItems}>
                        <input
                          id="interac"
                          type="radio"
                          name="withdrawalMethod"
                          value="interac"
                          checked={withdrawalMethod === 'interac'}
                          onChange={() => setWithdrawalMethod('interac')}
                          className={styles.h4}
                        />
                        <label htmlFor="interac" className={styles.ml2}>
                          Interac e-Transfer
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
                        required={withdrawalMethod === 'bank'}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="sortCode" className={styles.label}>
                        Sort Code
                      </label>
                      <input
                        id="sortCode"
                        type="text"
                        value={sortCode}
                        onChange={handleSortCodeChange}
                        className={styles.inputField}
                        placeholder="Enter numeric sort code"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        required={withdrawalMethod === 'bank'}
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
                        onChange={handleAccountNumberChange}
                        className={styles.inputField}
                        placeholder="Enter numeric account number"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        required={withdrawalMethod === 'bank'}
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
                        required={withdrawalMethod === 'bank'}
                      />
                    </div>
                  </div>
                )}
                
                {/* Interac e-Transfer Details (for Canada) */}
                {withdrawalMethod === 'interac' && country === 'canada' && (
                  <div className={styles.border}>
                    <div>
                      <label htmlFor="interacEmail" className={styles.label}>
                        Email Address for Interac e-Transfer
                      </label>
                      <input
                        id="interacEmail"
                        type="email"
                        value={interacEmail}
                        onChange={(e) => setInteracEmail(e.target.value)}
                        className={styles.inputField}
                        placeholder="Enter your email address"
                        required={withdrawalMethod === 'interac'}
                      />
                      <p className={styles.opacity75}>
                        We'll send your funds to this email address via Interac e-Transfer
                      </p>
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