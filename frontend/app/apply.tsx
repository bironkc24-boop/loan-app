import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { loanProducts } from '../utils/loanProducts';

export default function ApplyScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(loanProducts[0]);
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [purpose, setPurpose] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickDocument = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments([...documents, result.assets[0].uri]);
      Alert.alert('Success', 'Document uploaded successfully');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to apply for a loan', [
        { text: 'Sign In', onPress: () => router.push('/login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (!amount || !term || !purpose || !monthlyIncome || !employmentStatus) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const loanAmount = parseFloat(amount);
    const loanTerm = parseInt(term);

    if (loanAmount < selectedProduct.minAmount || loanAmount > selectedProduct.maxAmount) {
      Alert.alert('Error', `Loan amount must be between $${selectedProduct.minAmount} and $${selectedProduct.maxAmount}`);
      return;
    }

    if (loanTerm < selectedProduct.minTerm || loanTerm > selectedProduct.maxTerm) {
      Alert.alert('Error', `Loan term must be between ${selectedProduct.minTerm} and ${selectedProduct.maxTerm} months`);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/loans', {
        amount: loanAmount,
        term_months: loanTerm,
        purpose,
        loan_type: selectedProduct.id,
        monthly_income: parseFloat(monthlyIncome),
        employment_status: employmentStatus,
      });

      Alert.alert(
        'Application Submitted!',
        'Your loan application has been submitted successfully. You can track its status in the Status tab.',
        [
          {
            text: 'View Status',
            onPress: () => router.push('/status'),
          },
        ]
      );
      
      setAmount('');
      setTerm('');
      setPurpose('');
      setMonthlyIncome('');
      setEmploymentStatus('');
      setDocuments([]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loan Application</Text>
        <Text style={styles.headerSubtitle}>
          Complete the form below to apply
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Loan Details</Text>
        
        <Text style={styles.label}>Select Loan Type</Text>
        <View style={styles.productSelector}>
          {loanProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[
                styles.productButton,
                selectedProduct.id === product.id && styles.productButtonActive,
              ]}
              onPress={() => setSelectedProduct(product)}
            >
              <Text style={styles.productIcon}>{product.icon}</Text>
              <Text
                style={[
                  styles.productButtonText,
                  selectedProduct.id === product.id && styles.productButtonTextActive,
                ]}
              >
                {product.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Loan Amount *</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder={`$${selectedProduct.minAmount} - $${selectedProduct.maxAmount}`}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Loan Term (Months) *</Text>
        <TextInput
          style={styles.input}
          value={term}
          onChangeText={setTerm}
          placeholder={`${selectedProduct.minTerm} - ${selectedProduct.maxTerm} months`}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Purpose *</Text>
        <TextInput
          style={styles.input}
          value={purpose}
          onChangeText={setPurpose}
          placeholder="e.g., Business expansion, Education, Home renovation"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Financial Information</Text>

        <Text style={styles.label}>Monthly Income *</Text>
        <TextInput
          style={styles.input}
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
          placeholder="$5000"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Employment Status *</Text>
        <TextInput
          style={styles.input}
          value={employmentStatus}
          onChangeText={setEmploymentStatus}
          placeholder="Full-time, Part-time, Self-employed, etc."
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Documents</Text>
        <Text style={styles.label}>Upload Supporting Documents</Text>
        <Text style={styles.helperText}>
          Upload ID, proof of income, or other relevant documents
        </Text>

        <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
          <Text style={styles.uploadButtonText}>📎 Upload Document</Text>
        </TouchableOpacity>

        {documents.length > 0 && (
          <View style={styles.documentsContainer}>
            <Text style={styles.documentsTitle}>
              Uploaded: {documents.length} document(s)
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Application</Text>
        )}
      </TouchableOpacity>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          By submitting this application, you agree to our terms and conditions
          and authorize us to verify the information provided.
        </Text>
      </View>
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
  formSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  productSelector: {
    marginBottom: 16,
  },
  productButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  productButtonActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  productIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  productButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  productButtonTextActive: {
    color: '#4F46E5',
  },
  uploadButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  documentsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  documentsTitle: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  disclaimer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
});
