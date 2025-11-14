import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send reset email');
      }

      setEmailSent(true);
      Alert.alert(
        'Email Sent!',
        'Please check your email for password reset instructions.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#4F46E5" />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed-outline" size={60} color="#4F46E5" />
        </View>
        <Text style={styles.headerTitle}>Forgot Password?</Text>
        <Text style={styles.headerSubtitle}>
          No worries! Enter your email address and we'll send you instructions to reset your password.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading && !emailSent}
          />
        </View>

        <TouchableOpacity
          style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading || emailSent}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.resetButtonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.loginLinkText}>
            <Ionicons name="arrow-back" size={14} color="#4F46E5" />{' '}
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
        <Text style={styles.infoText}>
          If you don't receive an email within a few minutes, please check your spam folder or try again.
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
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  resetButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    padding: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    marginLeft: 12,
    lineHeight: 20,
  },
});
