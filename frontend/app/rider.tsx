import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/loanCalculator';

interface Assignment {
  id: string;
  loan_id: string;
  status: string;
  assigned_at: string;
  completed_at?: string;
  loans?: {
    id: string;
    amount: number;
    loan_type: string;
    purpose: string;
    users?: {
      full_name: string;
      email: string;
      phone: string;
    };
  };
}

interface RiderMetrics {
  total_assignments: number;
  completed_assignments: number;
  pending_assignments: number;
  completion_rate: number;
}

export default function RiderPortal() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'assignments' | 'metrics'>('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [metrics, setMetrics] = useState<RiderMetrics | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!hasRole('rider')) {
      Alert.alert('Access Denied', 'You do not have rider privileges');
      router.back();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (activeTab === 'assignments') {
        const data = await api.get('/rider/assignments');
        setAssignments(data.assignments || []);
      } else if (activeTab === 'metrics') {
        const data = await api.get('/rider/metrics');
        setMetrics(data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const updateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    try {
      await api.put(`/rider/assignments/${assignmentId}/status`, {
        status: newStatus,
      });
      Alert.alert('Success', 'Assignment status updated successfully');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update assignment status');
    }
  };

  const toggleAvailability = async (value: boolean) => {
    try {
      await api.put('/rider/availability', { is_active: value });
      setIsActive(value);
      Alert.alert(
        'Success',
        value ? 'You are now active and can receive assignments' : 'You are now inactive'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update availability');
      setIsActive(!value);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      case 'assigned':
        return '#6B7280';
      default:
        return '#9CA3AF';
    }
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    const loan = assignment.loans;
    if (!loan) return null;

    return (
      <View key={assignment.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {loan.users?.full_name || 'Unknown Borrower'}
            </Text>
            <Text style={styles.cardSubtitle}>{loan.users?.email}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(assignment.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {assignment.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loan Amount:</Text>
            <Text style={styles.detailValue}>{formatCurrency(loan.amount)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loan Type:</Text>
            <Text style={styles.detailValue}>{loan.loan_type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purpose:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {loan.purpose}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact:</Text>
            <Text style={styles.detailValue}>{loan.users?.phone || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned:</Text>
            <Text style={styles.detailValue}>
              {new Date(assignment.assigned_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {assignment.status === 'assigned' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateAssignmentStatus(assignment.id, 'in_progress')}
          >
            <Text style={styles.actionButtonText}>Start Verification</Text>
          </TouchableOpacity>
        )}

        {assignment.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10B981' }]}
            onPress={() => updateAssignmentStatus(assignment.id, 'completed')}
          >
            <Text style={styles.actionButtonText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}

        {assignment.status === 'completed' && assignment.completed_at && (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#065F46" />
            <Text style={styles.completedText}>
              Completed on {new Date(assignment.completed_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderMetrics = () => {
    if (!metrics) return null;

    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.total_assignments}</Text>
          <Text style={styles.metricLabel}>Total Assignments</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>
            {metrics.completed_assignments}
          </Text>
          <Text style={styles.metricLabel}>Completed</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#F59E0B' }]}>
            {metrics.pending_assignments}
          </Text>
          <Text style={styles.metricLabel}>Pending</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#4F46E5' }]}>
            {(metrics.completion_rate * 100).toFixed(0)}%
          </Text>
          <Text style={styles.metricLabel}>Completion Rate</Text>
        </View>
      </View>
    );
  };

  if (!hasRole('rider')) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rider Portal</Text>
      </View>

      <View style={styles.availabilityBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.availabilityLabel}>Availability Status</Text>
          <Text style={styles.availabilitySubtext}>
            {isActive
              ? 'You can receive new assignments'
              : 'You will not receive new assignments'}
          </Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={toggleAvailability}
          trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
          thumbColor={isActive ? '#4F46E5' : '#f4f3f4'}
        />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assignments' && styles.tabActive]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'assignments' && styles.tabTextActive,
            ]}
          >
            Assignments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'metrics' && styles.tabActive]}
          onPress={() => setActiveTab('metrics')}
        >
          <Text
            style={[styles.tabText, activeTab === 'metrics' && styles.tabTextActive]}
          >
            Metrics
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'assignments' && (
            <>
              {assignments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="bicycle-outline" size={64} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No Assignments</Text>
                  <Text style={styles.emptyText}>
                    You don't have any assignments yet. Check back later!
                  </Text>
                </View>
              ) : (
                assignments.map(renderAssignmentCard)
              )}
            </>
          )}

          {activeTab === 'metrics' && renderMetrics()}
        </ScrollView>
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
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  availabilityBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  availabilitySubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
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
    flex: 1,
    textAlign: 'right',
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedBanner: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
