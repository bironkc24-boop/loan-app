import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { getApplications } from '../utils/storage';
import { LoanApplication } from '../types';

export default function StatusScreen() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadApplications = async () => {
    const apps = await getApplications();
    setApplications(apps.sort((a, b) => 
      new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
    ));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const getStatusColor = (status: LoanApplication['status']) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'reviewing':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: LoanApplication['status']) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✕';
      case 'reviewing':
        return '⟳';
      default:
        return '⋯';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderApplication = ({ item }: { item: LoanApplication }) => (
    <View style={styles.applicationCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.dateText}>{formatDate(item.dateApplied)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Loan Amount</Text>
          <Text style={styles.detailValue}>
            ${item.amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Term</Text>
          <Text style={styles.detailValue}>{item.term} months</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Application ID</Text>
          <Text style={styles.detailValue}>#{item.id}</Text>
        </View>
      </View>

      {item.status === 'pending' && (
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            ⏱️ Estimated processing time: 2-3 business days
          </Text>
        </View>
      )}

      {item.status === 'reviewing' && (
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Application Status</Text>
        <Text style={styles.headerSubtitle}>
          Track your loan applications
        </Text>
      </View>

      {applications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Applications Yet</Text>
          <Text style={styles.emptyText}>
            You haven't submitted any loan applications. Visit the Apply tab to
            get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderApplication}
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
  },
});
