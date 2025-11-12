import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/loanCalculator';

interface Loan {
  id: string;
  amount: number;
  term_months: number;
  status: string;
  purpose: string;
  loan_type: string;
  created_at: string;
}

export default function StatusScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadLoans = async () => {
    if (!user) {
      setLoans([]);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('/loans');
      setLoans(data.loans || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load loans. Please try again.');
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadLoans();
    }
  }, [user, authLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoans();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'disbursed':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'under_review':
      case 'reviewing':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'disbursed':
        return '✓';
      case 'rejected':
        return '✕';
      case 'under_review':
      case 'reviewing':
        return '⟳';
      default:
        return '⋯';
    }
  };

  const getLoanTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'personal': 'Personal Loan',
      'business': 'Business Loan',
      'education': 'Education Loan',
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderLoan = ({ item }: { item: Loan }) => (
    <View style={styles.applicationCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.productName}>{getLoanTypeName(item.loan_type)}</Text>
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
          <Text style={styles.statusText}>
            {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Loan Amount</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(item.amount)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Term</Text>
          <Text style={styles.detailValue}>{item.term_months} months</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Purpose</Text>
          <Text style={styles.detailValue}>{item.purpose}</Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            ⏱️ Estimated processing time: 2-3 business days
          </Text>
        </View>
      )}

      {item.status === 'under_review' && (
        <View style={[styles.cardFooter, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.footerText, { color: '#92400E' }]}>
            📋 Under review - We may contact you for additional information
          </Text>
        </View>
      )}

      {item.status === 'approved' && (
        <View style={[styles.cardFooter, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.footerText, { color: '#065F46' }]}>
            🎉 Congratulations! Your loan has been approved
          </Text>
        </View>
      )}

      {item.status === 'rejected' && (
        <View style={[styles.cardFooter, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.footerText, { color: '#991B1B' }]}>
            Unfortunately, your application was not approved at this time
          </Text>
        </View>
      )}
    </View>
  );

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading loans...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🔒</Text>
        <Text style={styles.emptyTitle}>Sign In Required</Text>
        <Text style={styles.emptyText}>
          Please sign in to view your loan applications
        </Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Loan Applications</Text>
        <Text style={styles.headerSubtitle}>
          Track the status of your loan applications
        </Text>
      </View>

      {loans.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Applications Yet</Text>
          <Text style={styles.emptyText}>
            You haven't submitted any loan applications yet. Start your journey by
            applying for a loan!
          </Text>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => router.push('/apply')}
          >
            <Text style={styles.applyButtonText}>Apply for a Loan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={loans}
          renderItem={renderLoan}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 24,
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  listContainer: {
    padding: 16,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    color: '#FFFFFF',
    marginRight: 4,
    fontSize: 14,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cardFooter: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  footerText: {
    fontSize: 13,
    color: '#075985',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  signInButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
