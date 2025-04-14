'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useReferral } from '@/context/ReferralContext';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import styles from './transactions.module.css';
import Preloader from '@/components/Preloader';

// Define currency data for the Canadian dollar
const CURRENCY = {
  code: 'CAD',
  symbol: 'C$',
  name: 'Canadian Dollar'
};

// Define transaction type
interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending';
  pointsEarned: number;
}

export default function Transactions() {
  const router = useRouter();
  const { user, loading, setPageLoading } = useAuth();
  const { transactions } = useReferral();
  
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

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending',
  });

  // Generate mock data for transactions (we'll use this in addition to the context data)
  const generateMockTransactions = (): Transaction[] => {
    const mockTransactions: Transaction[] = [];
    
    for (let i = 1; i <= 20; i++) {
      const status: ('completed' | 'pending') = 
        i % 3 === 0 ? 'pending' : 'completed';
      
      mockTransactions.push({
        id: `trans-${i}`,
        userId: `user-${i % 5 + 1}`,
        userName: `User ${i % 5 + 1}`,
        amount: Math.floor(Math.random() * 200) + 100, // C$100-C$300 range
        date: new Date(Date.now() - Math.floor(Math.random() * 60 * 24) * 60 * 60 * 1000),
        status,
        pointsEarned: status === 'completed' ? (Math.floor(Math.random() * 5) + 1) * 10 : 0,
      });
    }
    
    return mockTransactions;
  };

  const [isLoading, setIsLoading] = useState(false);
  
  // Combine mock data with context data
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // For now, just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = generateMockTransactions();
        setAllTransactions([...transactions, ...mockData]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [transactions]);

  // Filter transactions based on search term and status
  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch = transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'ascending' 
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime();
    }
    
    if (sortConfig.key === 'amount' || sortConfig.key === 'pointsEarned') {
      return sortConfig.direction === 'ascending'
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    }
    
    const valueA = String(a[sortConfig.key]).toLowerCase();
    const valueB = String(b[sortConfig.key]).toLowerCase();
    
    if (sortConfig.direction === 'ascending') {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  // Handle sort
  const handleSort = (key: keyof Transaction) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending',
    });
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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

      {/* Search and Filter Bar */}
      <div className={styles.filterCard}>
        <div className={styles.filterContainer}>
          <div className={styles.searchContainer}>
            <div className={styles.searchIconWrapper}>
              <FaSearch className={styles.searchIcon} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by user name or transaction ID"
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className={styles.tableContainer}>
        {filteredTransactions.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className={styles.mobileCards}>
              {sortedTransactions.map((transaction) => (
                <div key={transaction.id} className={styles.transactionCard}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>User</span>
                    <span className={styles.cardValue}>{transaction.userName}</span>
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
                    <span className={styles.cardValue}>{formatDate(transaction.date)}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Status</span>
                    <span className={`${styles.statusTag} ${transaction.status === 'completed' ? styles.completedTag : styles.pendingTag}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Points Earned</span>
                    <span className={styles.cardValue}>
                      {transaction.status === 'pending' ? 
                        'Pending' : 
                        `${transaction.pointsEarned} points`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className={styles.mobileTable}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th 
                    scope="col" 
                    className={styles.tableHeaderCell}
                    onClick={() => handleSort('userName')}
                  >
                    <div className={styles.headerContent}>
                      User
                      {sortConfig.key === 'userName' && (
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
                    onClick={() => handleSort('date')}
                  >
                    <div className={styles.headerContent}>
                      Date
                      {sortConfig.key === 'date' && (
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
                    onClick={() => handleSort('pointsEarned')}
                  >
                    <div className={styles.headerContent}>
                      Points Earned
                      {sortConfig.key === 'pointsEarned' && (
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
                      <div className={styles.cellContent}>{transaction.userName}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellContent}>
                        {transaction.status === 'pending' ? 
                          '—' : 
                          `${CURRENCY.symbol}${transaction.amount.toLocaleString()}`}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellContent}>{formatDate(transaction.date)}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.statusTag} ${transaction.status === 'completed' ? styles.completedTag : styles.pendingTag}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.cellContent}>
                        {transaction.status === 'pending' ? 
                          '—' : 
                          `${transaction.pointsEarned} points`}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className={styles.emptyState}>
            No transactions found matching your criteria
          </div>
        )}
      </div>

      {/* Show preloader when transactions are loading */}
      {isLoading && <Preloader fullScreen state="transactions" />}
    </div>
  );
} 