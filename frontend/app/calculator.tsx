import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { calculateLoan, formatCurrency } from '../utils/loanCalculator';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function CalculatorScreen() {
  const [amount, setAmount] = useState('10000');
  const [rate, setRate] = useState('8.5');
  const [term, setTerm] = useState('24');

  const calculation = calculateLoan(
    parseFloat(amount) || 0,
    parseFloat(rate) || 0,
    parseInt(term) || 1
  );

  const monthlyData = [];
  let balance = calculation.loanAmount;
  const monthlyRate = calculation.interestRate / 100 / 12;
  
  for (let i = 0; i <= Math.min(12, calculation.termMonths); i++) {
    monthlyData.push(balance);
    if (i < calculation.termMonths) {
      const interest = balance * monthlyRate;
      const principal = calculation.monthlyPayment - interest;
      balance = Math.max(0, balance - principal);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loan Calculator</Text>
        <Text style={styles.headerSubtitle}>
          See how much you'll pay monthly
        </Text>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Loan Amount</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>₱</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="10000"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Interest Rate (APR)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={rate}
              onChangeText={setRate}
              keyboardType="numeric"
              placeholder="8.5"
            />
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Loan Term (Months)</Text>
          <TextInput
            style={styles.inputFull}
            value={term}
            onChangeText={setTerm}
            keyboardType="numeric"
            placeholder="24"
          />
        </View>
      </View>

      <View style={styles.resultSection}>
        <Text style={styles.resultTitle}>Monthly Payment</Text>
        <Text style={styles.resultAmount}>
          {formatCurrency(calculation.monthlyPayment)}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Payment</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(calculation.totalPayment)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Interest</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(calculation.totalInterest)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Principal Amount</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(calculation.loanAmount)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Loan Balance Over Time</Text>
        <LineChart
          data={{
            labels: ['Start', '', '', '', '', '', '', '', '', '', '', 'End'],
            datasets: [
              {
                data: monthlyData,
              },
            ],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#4F46E5',
            backgroundGradientFrom: '#4F46E5',
            backgroundGradientTo: '#6366F1',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <TouchableOpacity style={styles.applyButton}>
        <Text style={styles.applyButtonText}>Apply for This Loan</Text>
      </TouchableOpacity>
    </ScrollView>
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
  inputSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 4,
  },
  percentSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputFull: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  resultSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  resultAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  chartSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  applyButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
