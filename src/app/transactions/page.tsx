'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useReferral } from '@/context/ReferralContext';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import styles from './transactions.module.css';
import Preloader from '@/components/Preloader';

const CURRENCY = {
  code: 'CAD',
  symbol: 'C$',
  name: 'Canadian Dollar'
};

interface Transaction {
  id: number;
  points: number;
  amount: number;
  currency: string;
  status: string;
  created_at: Date;
  referred: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function Transactions() {
  const router = useRouter();
  const { user, loading, setPageLoading } = useAuth();
  const { 
    transactions, 
    fetchTransactions,
    hasMoreTransactions,
    isLoading: referralLoading
  } = useReferral();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      fetchTransactions(1);
    }
  }, [user, loading, fetchTransactions]);

  useEffect(() => {
    setPageLoading(false);
    return () => setPageLoading(true);
  }, [setPageLoading]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: 'ascending' | 'descending';
  }>({
    key: 'created_at',
    direction: 'descending',
  });

  const formattedTransactions = useMemo(() => transactions?.map(t => ({
    ...t,
    created_at: new Date(t.created_at),
    status: t.status.toLowerCase()
  })), [transactions]);

  const filteredTransactions = useMemo(() => {
    return formattedTransactions?.filter(transaction => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        transaction.referred.first_name.toLowerCase().includes(searchLower) ||
        transaction.referred.last_name.toLowerCase().includes(searchLower) ||
        transaction.referred.email.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [formattedTransactions, searchTerm, statusFilter]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const sortKey = sortConfig.key;
      const direction = sortConfig.direction === 'ascending' ? 1 : -1;

      if (sortKey === 'created_at') {
        return direction * (a.created_at.getTime() - b.created_at.getTime());
      }
      if (sortKey === 'amount' || sortKey === 'points') {
        return direction * (a[sortKey] - b[sortKey]);
      }
      if (sortKey === 'referred') {
        const aName = `${a.referred.first_name} ${a.referred.last_name}`.toLowerCase();
        const bName = `${b.referred.first_name} ${b.referred.last_name}`.toLowerCase();
        return direction * aName.localeCompare(bName);
      }
      return 0;
    });
  }, [filteredTransactions, sortConfig]);

  const handleSort = (key: keyof Transaction) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleLoadMore = () => {
    if (hasMoreTransactions && !referralLoading) {
      fetchTransactions();
    }
  };

  if (loading || !user) {
    return <Preloader fullScreen state="transactions" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Transaction History</h1>
        <p className={styles.subtitle}>View and filter all transactions from your referrals</p>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterContainer}>
          <div className={styles.searchContainer}>
            <div className={styles.searchIconWrapper}>
              <FaSearch className={styles.searchIcon} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filterWrapper}>
            <div className={styles.filterIconWrapper}>
              <FaFilter className={styles.filterIcon} />
            </div>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {sortedTransactions.length > 0 ? (
          <>
            <div className={styles.mobileCards}>
              {sortedTransactions.map((transaction) => (
                <div key={transaction.id} className={styles.transactionCard}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>User</span>
                    <span className={styles.cardValue}>
                      {`${transaction.referred.first_name} ${transaction.referred.last_name}`}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Amount</span>
                    <span className={styles.cardValue}>
                      {transaction.status === 'pending' ? 
                        'Pending' : 
                        `${CURRENCY.symbol}${transaction.amount.toLocaleString()}`}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Date</span>
                    <span className={styles.cardValue}>{formatDate(transaction.created_at)}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Status</span>
                    <span className={`${styles.statusTag} ${
                      transaction.status === 'completed' ? styles.completedTag : styles.pendingTag
                    }`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Points Earned</span>
                    <span className={styles.cardValue}>
                      {transaction.status === 'pending' ? 
                        'Pending' : 
                        `${transaction.points.toLocaleString()} points`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <table className={styles.mobileTable}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th 
                    scope="col" 
                    className={styles.tableHeaderCell}
                    onClick={() => handleSort('referred')}
                  >
                    <div className={styles.headerContent}>
                      User
                      {sortConfig.key === 'referred' && (
                        sortConfig.direction === 'ascending' ? 
                          <FaSortAmountUp className={styles.sortIcon} /> : 
                          <FaSortAmountDown className={styles.sortIcon} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className={styles.tableHeaderCell}
                    onClick={() => handleSort('amount')}
                  >
                    <div className={styles.headerContent}>
                      Amount
                      {sortConfig.key === 'amount' && (
                        sortConfig.direction === 'ascending' ? 
                          <FaSortAmountUp className={styles.sortIcon} /> : 
                          <FaSortAmountDown className={styles.sortIcon} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className={styles.tableHeaderCell}
                    onClick={() => handleSort('created_at')}
                  >
                    <div className={styles.headerContent}>
                      Date
                      {sortConfig.key === 'created_at' && (
                        sortConfig.direction === 'ascending' ? 
                          <FaSortAmountUp className={styles.sortIcon} /> : 
                          <FaSortAmountDown className={styles.sortIcon} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className={styles.tableHeaderCell}
                    onClick={() => handleSort('status')}
                  >
                    <div className={styles.headerContent}>
                      Status
                      {sortConfig.key === 'status' && (
                        sortConfig.direction === 'ascending' ? 
                          <FaSortAmountUp className={styles.sortIcon} /> : 
                          <FaSortAmountDown className={styles.sortIcon} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className={styles.tableHeaderCell}
                    onClick={() => handleSort('points')}
                  >
                    <div className={styles.headerContent}>
                      Points Earned
                      {sortConfig.key === 'points' && (
                        sortConfig.direction === 'ascending' ? 
                          <FaSortAmountUp className={styles.sortIcon} /> : 
                          <FaSortAmountDown className={styles.sortIcon} />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {sortedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className={styles.tableCell}>
                      <div className={styles.cellContent}>
                        {`${transaction.referred.first_name} ${transaction.referred.last_name}`}
                        <div className={styles.emailText}>{transaction.referred.email}</div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellContent}>
                        {transaction.status === 'pending' ? 
                          '—' : 
                          `${CURRENCY.symbol}${transaction.amount.toLocaleString()}`}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellContent}>
                        {formatDate(transaction.created_at)}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.statusTag} ${
                        transaction.status === 'active' ? styles.completedTag : styles.pendingTag
                      }`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellContent}>
                        {transaction.status === 'pending' ? 
                          '—' : 
                          `${transaction.points.toLocaleString()} points`}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasMoreTransactions && (
              <div className={styles.loadMoreContainer}>
                <button
                  className={styles.loadMoreButton}
                  onClick={handleLoadMore}
                  disabled={referralLoading}
                >
                  {referralLoading ? 'Loading...' : 'Load More Transactions'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            {referralLoading ? 'Loading transactions...' : 'No transactions found matching your criteria'}
          </div>
        )}
      </div>

      {referralLoading && <Preloader fullScreen state="transactions" />}
    </div>
  );
}