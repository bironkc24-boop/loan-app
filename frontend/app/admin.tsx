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
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/loanCalculator';

interface Loan {
  id: string;
  user_id: string;
  amount: number;
  term_months: number;
  status: string;
  purpose: string;
  loan_type: string;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
}

interface Rider {
  id: string;
  user_id: string;
  zone: string;
  is_active: boolean;
  max_assignments: number;
  current_assignments: number;
  users?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

interface Metrics {
  total_loans: number;
  pending_loans: number;
  approved_loans: number;
  rejected_loans: number;
  total_disbursed: number;
  active_riders: number;
}

export default function AdminDashboard() {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'loans' | 'riders' | 'metrics'>('loans');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [newRiderEmail, setNewRiderEmail] = useState('');
  const [newRiderZone, setNewRiderZone] = useState('');

  useEffect(() => {
    if (!hasRole('admin')) {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      router.back();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (activeTab === 'loans') {
        const data = await api.get('/admin/loans');
        setLoans(data.loans || []);
      } else if (activeTab === 'riders') {
        const data = await api.get('/admin/riders');
        setRiders(data.riders || []);
      } else if (activeTab === 'metrics') {
        const data = await api.get('/admin/metrics');
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

  const updateLoanStatus = async (loanId: string, newStatus: string) => {
    try {
      await api.put(`/admin/loans/${loanId}`, { status: newStatus });
      Alert.alert('Success', 'Loan status updated successfully');
      setShowStatusModal(false);
      setSelectedLoan(null);
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update loan status');
    }
  };

  const createRider = async () => {
    if (!newRiderEmail || !newRiderZone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await api.post('/admin/riders', {
        email: newRiderEmail,
        zone: newRiderZone,
        max_assignments: 10,
      });
      Alert.alert('Success', 'Rider created successfully');
      setShowRiderModal(false);
      setNewRiderEmail('');
      setNewRiderZone('');
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create rider');
    }
  };

  const toggleRiderStatus = async (riderId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/riders/${riderId}`, { is_active: !isActive });
      Alert.alert('Success', `Rider ${!isActive ? 'activated' : 'deactivated'} successfully`);
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update rider status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'disbursed':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'under_review':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const renderLoanCard = (loan: Loan) => (
    <View key={loan.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {loan.users?.full_name || 'Unknown User'}
          </Text>
          <Text style={styles.cardSubtitle}>{loan.users?.email}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(loan.status) }]}
        >
          <Text style={styles.statusText}>
            {loan.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>{formatCurrency(loan.amount)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Term:</Text>
          <Text style={styles.detailValue}>{loan.term_months} months</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type:</Text>
          <Text style={styles.detailValue}>{loan.loan_type}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Purpose:</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {loan.purpose}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          setSelectedLoan(loan);
          setShowStatusModal(true);
        }}
      >
        <Text style={styles.actionButtonText}>Update Status</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRiderCard = (rider: Rider) => (
    <View key={rider.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {rider.users?.full_name || 'Unknown Rider'}
          </Text>
          <Text style={styles.cardSubtitle}>{rider.users?.email}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: rider.is_active ? '#10B981' : '#9CA3AF' },
          ]}
        >
          <Text style={styles.statusText}>
            {rider.is_active ? 'ACTIVE' : 'INACTIVE'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Zone:</Text>
          <Text style={styles.detailValue}>{rider.zone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Assignments:</Text>
          <Text style={styles.detailValue}>
            {rider.current_assignments || 0} / {rider.max_assignments}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{rider.users?.phone || 'N/A'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          !rider.is_active && styles.actionButtonSecondary,
        ]}
        onPress={() => toggleRiderStatus(rider.id, rider.is_active)}
      >
        <Text
          style={[
            styles.actionButtonText,
            !rider.is_active && styles.actionButtonTextSecondary,
          ]}
        >
          {rider.is_active ? 'Deactivate' : 'Activate'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMetrics = () => {
    if (!metrics) return null;

    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.total_loans}</Text>
          <Text style={styles.metricLabel}>Total Loans</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#F59E0B' }]}>
            {metrics.pending_loans}
          </Text>
          <Text style={styles.metricLabel}>Pending</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>
            {metrics.approved_loans}
          </Text>
          <Text style={styles.metricLabel}>Approved</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#EF4444' }]}>
            {metrics.rejected_loans}
          </Text>
          <Text style={styles.metricLabel}>Rejected</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {formatCurrency(metrics.total_disbursed || 0)}
          </Text>
          <Text style={styles.metricLabel}>Total Disbursed</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics.active_riders}</Text>
          <Text style={styles.metricLabel}>Active Riders</Text>
        </View>
      </View>
    );
  };

  if (!hasRole('admin')) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'loans' && styles.tabActive]}
          onPress={() => setActiveTab('loans')}
        >
          <Text
            style={[styles.tabText, activeTab === 'loans' && styles.tabTextActive]}
          >
            Loans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'riders' && styles.tabActive]}
          onPress={() => setActiveTab('riders')}
        >
          <Text
            style={[styles.tabText, activeTab === 'riders' && styles.tabTextActive]}
          >
            Riders
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
          {activeTab === 'loans' && (
            <>
              {loans.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No loans found</Text>
                </View>
              ) : (
                loans.map(renderLoanCard)
              )}
            </>
          )}

          {activeTab === 'riders' && (
            <>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowRiderModal(true)}
              >
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create New Rider</Text>
              </TouchableOpacity>
              {riders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No riders found</Text>
                </View>
              ) : (
                riders.map(renderRiderCard)
              )}
            </>
          )}

          {activeTab === 'metrics' && renderMetrics()}
        </ScrollView>
      )}

      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Loan Status</Text>
            <Text style={styles.modalSubtitle}>
              Loan Amount: {selectedLoan ? formatCurrency(selectedLoan.amount) : ''}
            </Text>

            <TouchableOpacity
              style={styles.statusOption}
              onPress={() => updateLoanStatus(selectedLoan!.id, 'under_review')}
            >
              <Text style={styles.statusOptionText}>Under Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusOption}
              onPress={() => updateLoanStatus(selectedLoan!.id, 'approved')}
            >
              <Text style={styles.statusOptionText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusOption}
              onPress={() => updateLoanStatus(selectedLoan!.id, 'rejected')}
            >
              <Text style={styles.statusOptionText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRiderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRiderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Rider</Text>

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={newRiderEmail}
              onChangeText={setNewRiderEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Zone (e.g., North, South, East, West)"
              value={newRiderZone}
              onChangeText={setNewRiderZone}
            />

            <TouchableOpacity style={styles.submitButton} onPress={createRider}>
              <Text style={styles.submitButtonText}>Create Rider</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRiderModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonTextSecondary: {
    color: '#4F46E5',
  },
  createButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  statusOption: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
