'use client';

import { useEffect, useState, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useReferral } from '@/context/ReferralContext';
import { FaMoneyBillWave, FaHistory, FaCheckCircle, FaExchangeAlt, FaStar, FaCalculator } from 'react-icons/fa';
import styles from './withdrawal.module.css';
import Preloader from '@/components/Preloader';
import SlideNotification from '@/components/SlideNotification';

const CURRENCY_MAP = {
  canada: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    rate: 1 // Base currency
  },
};

type CountryKey = keyof typeof CURRENCY_MAP;

export default function Withdrawal() {
  const router = useRouter();
  const { user, loading, setPageLoading } = useAuth();
  const { 
    analytics, 
    withdrawalHistory, 
    requestWithdrawal, 
    isLoading: referralLoading,
    error: referralError
  } = useReferral();
  
  const [amount, setAmount] = useState<string>('');
  const [calculatorPoints, setCalculatorPoints] = useState<string>('');
  const [email, setEmail] = useState(user?.email || '');
  const [accountName, setAccountName] = useState(user?.name || '');
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Currency and conversion settings
  const userCountry = 'canada' as CountryKey;
  const currency = CURRENCY_MAP[userCountry];
  const POINTS_TO_CASH_RATE = 100;
  const MIN_WITHDRAWAL_AMOUNT = 4;

  // Points calculations
  const availablePoints = analytics?.points_earned || 0;
  const availableBalance = (availablePoints / POINTS_TO_CASH_RATE) || 0;
  
 // Update the calculator value calculation
const calculatedValue = useMemo(() => 
  (parseFloat(calculatorPoints) || 0) / POINTS_TO_CASH_RATE,
  [calculatorPoints]
);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    setPageLoading(false);
    return () => setPageLoading(true);
  }, [setPageLoading]);

  const handleWithdrawal = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const parsedAmount = parseFloat(amount);
      
      // Validation
      if (!parsedAmount || parsedAmount < MIN_WITHDRAWAL_AMOUNT) {
        throw new Error(`Minimum withdrawal: ${currency.symbol}${MIN_WITHDRAWAL_AMOUNT}`);
      }
      
      //if (parsedAmount > availableBalance) {
       // throw new Error(`Exceeds available ${currency.symbol}${availableBalance}`);
      //}
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Valid email required');
      }

      if (!accountName.trim()) {
        throw new Error('Account name is required');
      }

      // Calculate points needed
      const pointsNeeded = parsedAmount * POINTS_TO_CASH_RATE;
      //if (pointsNeeded > availablePoints) {
        //throw new Error(`Insufficient points. Needed: ${pointsNeeded}`);
      //}

      // API call
      await requestWithdrawal({
        currency: currency.code,
        amount: parsedAmount,
        point: pointsNeeded,
        withdrawal_method: "interac",
        bank_name: "interac",
        email: email,
        account_name: accountName
      });
      
      // Show success
      setShowNotification(true);
      setAmount('');
      setEmail(user?.email || '');
      setAccountName(user?.name || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  if (loading || !user || referralLoading) {
    return <Preloader fullScreen state="withdrawal" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Withdraw Funds</h1>
        <p className={styles.subtitle}>Convert your points to cash and withdraw</p>
      </div>

      <SlideNotification
        show={showNotification}
        message="Withdrawal request submitted successfully!"
        type="success"
        duration={5000}
        onClose={() => setShowNotification(false)}
      />

      {error && (
        <div className={styles.errorAlert} role="alert">
          <span>{error}</span>
        </div>
      )}

      {submitting && <Preloader fullScreen state="withdrawal_process" />}

      <div className={styles.contentGrid}>
        {/* Side Cards */}
        <div className={styles.sideCards}>
          <div className={styles.pointsCard}>
            <div className={styles.cardHeader}>
              <FaStar className={styles.headerIcon} />
              <h2 className={styles.headerTitle}>Available Points</h2>
            </div>
            <div className={styles.text4xl}>{availablePoints.toLocaleString()}</div>
            <div className={styles.flexItems}>
              <FaExchangeAlt className={styles.icon} />
              <span>1 point = {currency.symbol}{POINTS_TO_CASH_RATE}</span>
            </div>
          </div>

          
          <div className={styles.cashCard}>
            <div className={styles.cardHeader}>
              <FaMoneyBillWave className={styles.headerIcon} />
              <h2 className={styles.headerTitle}>Cash Value ({currency.code})</h2>
            </div>
            <div className={styles.text4xl}>{currency.symbol}{availableBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
            <p className={styles.opacity75}>Available for withdrawal</p>
          </div>

          <div className={styles.calculatorCard}>
            <div className={styles.cardHeader}>
              <FaCalculator className={styles.headerIcon} />
              <h2 className={styles.headerTitle}>Points Calculator</h2>
            </div>
            <div className={styles.spacey4}>
              <div>
                <label className={styles.label}>Enter Points</label>
                <input
                  type="number"
                  value={calculatorPoints}
                  onChange={(e) => setCalculatorPoints(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter points to convert"
                />
              </div>
              <div className={styles.bgGray50}>
                <div className={styles.flexJustifyBetween}>
                  <span>Cash Value:</span>
                  <span className={styles.textWhatappDarkGreen}>
                    {currency.symbol}{calculatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
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
                <div>
                  <label className={styles.label}>Country & Currency</label>
                  <select
                    value={userCountry}
                    className={styles.inputField}
                    disabled
                  >
                    <option value="canada">Canada ({currency.symbol} {currency.code})</option>
                  </select>
                </div>

                <div>
                  <label className={styles.label}>Amount ({currency.symbol})</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={styles.inputField}
                    min={MIN_WITHDRAWAL_AMOUNT}
                    step="1"
                    required
                  />
                  <div className={styles.flexJustifyBetween}>
                    <span>Minimum: {currency.symbol}{MIN_WITHDRAWAL_AMOUNT}</span>
                    <span>Points Needed: {Math.ceil(parseFloat(amount) * POINTS_TO_CASH_RATE) || 0}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                  <p className="mb-4 text-sm text-gray-500">Interac transfer information</p>
                  
                  <div className={styles.paymentMethod}>
                    <input
                      type="radio"
                      id="interac"
                      checked
                      readOnly
                      className={styles.radioInput}
                    />
                    <label htmlFor="interac" className={styles.radioLabel}>
                      Interac Transfer ({currency.code})
                    </label>
                  </div>

                  <div className={styles.emailInput}>
                    <label className={styles.label}>Account Holder Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className={styles.inputField}
                      required
                    />
                  </div>

                  <div className={styles.emailInput}>
                    <label className={styles.label}>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.inputField}
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    We'll send your funds to this email address via Interac transfer
                  </p>
                </div>

                <button 
                  type="submit" 
                  className={styles.btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Submit Withdrawal Request'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Withdrawal History */}
       

        <div className={styles.historyCard}>
          <div className={`${styles.flexItems} ${styles.cardHeader}`}>
            <FaHistory className={styles.h5} />
            <h2 className={styles.textXl}>Withdrawal History</h2>
          </div>
          
          <div className={styles.card}>
            <div className={styles.overflowHidden}>
              {/* Mobile Card View */}
              <div className={styles.withdrawalMobileCards}>
                {withdrawalHistory?.map((withdrawal) => {
                 
                  return (
                    <div key={withdrawal.id} className={styles.withdrawalCard}>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>ID</span>
                        <span className={styles.withdrawalCardValue}>{withdrawal.id}</span>
                      </div>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>Amount</span>
                        <span className={styles.withdrawalCardValue}>
                        {currency.symbol}{withdrawal.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>Date</span>
                        <span className={styles.withdrawalCardValue}>{formatDate(withdrawal.created_at)}</span>
                      </div>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>Payment Method</span>
                        <span className={styles.withdrawalCardValue}>Interac Transfer</span>
                      </div>
                      <div className={styles.withdrawalCardRow}>
                        <span className={styles.withdrawalCardLabel}>Reference</span>
                        <span className={styles.withdrawalCardValue}>{withdrawal.transaction_reference || 'N/A'}</span>
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
                  {withdrawalHistory?.map((withdrawal) => {
                   
                    return (
                      <tr key={withdrawal.id}>
                        <td>{currency.symbol}{withdrawal.amount.toFixed(2)}</td>
                      <td>{formatDate(withdrawal.created_at)}</td>
                      <td>Interac Transfer</td>
                      <td>{withdrawal.transaction_reference || 'Processing...'}</td>
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