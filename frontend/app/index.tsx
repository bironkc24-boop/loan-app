import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const { user } = useAuth();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleContinue = () => {
    if (user) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleContinue}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="wallet" size={80} color="#FFFFFF" />
        </Animated.View>

        <Text style={styles.title}>QuickLoan</Text>
        <Text style={styles.subtitle}>Fast & Secure Loan Solutions</Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="flash" size={24} color="#A5B4FC" />
            <Text style={styles.featureText}>Quick Approval</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={24} color="#A5B4FC" />
            <Text style={styles.featureText}>100% Secure</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="cash" size={24} color="#A5B4FC" />
            <Text style={styles.featureText}>Flexible Terms</Text>
          </View>
        </View>

        <View style={styles.tapIndicator}>
          <Animated.View style={{ opacity: pulseAnim }}>
            <Ionicons name="hand-left" size={32} color="#A5B4FC" />
          </Animated.View>
          <Text style={styles.tapText}>Tap anywhere to continue</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by QuickLoan Philippines</Text>
        <Text style={styles.footerSubtext}>Your trusted financial partner</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E7FF',
    marginBottom: 48,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
    fontWeight: '600',
  },
  tapIndicator: {
    alignItems: 'center',
    marginTop: 20,
  },
  tapText: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#E0E7FF',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#C7D2FE',
    marginTop: 4,
  },
});
