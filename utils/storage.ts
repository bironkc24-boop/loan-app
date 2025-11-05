import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoanApplication } from '../types';

const APPLICATIONS_KEY = '@loan_applications';

export const saveApplication = async (application: LoanApplication): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(APPLICATIONS_KEY);
    const applications: LoanApplication[] = existingData ? JSON.parse(existingData) : [];
    applications.push(application);
    await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
  } catch (error) {
    console.error('Error saving application:', error);
    throw error;
  }
};

export const getApplications = async (): Promise<LoanApplication[]> => {
  try {
    const data = await AsyncStorage.getItem(APPLICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading applications:', error);
    return [];
  }
};

export const updateApplicationStatus = async (
  id: string,
  status: LoanApplication['status']
): Promise<void> => {
  try {
    const applications = await getApplications();
    const updated = applications.map(app =>
      app.id === id ? { ...app, status } : app
    );
    await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
};
