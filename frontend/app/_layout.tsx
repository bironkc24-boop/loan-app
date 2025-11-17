import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#4F46E5',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calculator"
          options={{
            title: 'Calculator',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calculator" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="apply"
          options={{
            title: 'Apply',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="status"
          options={{
            title: 'Status',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="register"
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="rider"
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="terms"
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
        <Tabs.Screen
          name="forgot-password"
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tabs>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <TabsLayout />
    </AuthProvider>
  );
}
