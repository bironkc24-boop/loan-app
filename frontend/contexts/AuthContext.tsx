import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { TERMS_VERSION } from '../constants/termsOfService';

interface UserProfile extends User {
  roles?: string[];
  full_name?: string;
  phone?: string;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', userId);

      const roles = userRoles?.map((ur: any) => ur.roles.name) || [];

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      setUser({
        ...session?.user,
        ...userProfile,
        roles,
      } as UserProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    setSession(data.session);
    if (data.user) {
      await fetchUserProfile(data.user.id);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    console.log('DEBUG: API_URL being used:', API_URL);
    console.log('DEBUG: Full endpoint:', `${API_URL}/auth/register`);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          phone,
          accepted_terms: true,
          terms_version: TERMS_VERSION,
        }),
      });

      console.log('DEBUG: Response status:', response.status);
      console.log('DEBUG: Response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.log('DEBUG: Error response:', error);
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      console.log('DEBUG: Success response:', data);

      setSession(data.session);
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error) {
      console.log('DEBUG: Fetch error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) || false;
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signIn, signUp, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
