import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TERMS_OF_SERVICE } from '../constants/termsOfService';
import { PRIVACY_POLICY } from '../constants/privacyPolicy';

export default function TermsScreen() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>
            Terms of Service
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.documentText}>
          {activeTab === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  documentText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
