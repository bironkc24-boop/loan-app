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
    console.log('DEBUG: AuthContext - Initializing auth state');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('DEBUG: AuthContext - Initial session:', session?.user?.id);
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        console.log('DEBUG: AuthContext - No initial session, setting loading false');
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('DEBUG: AuthContext - Auth state change event:', _event, 'Session:', session?.user?.id);
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        console.log('DEBUG: AuthContext - No session, clearing user');
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('DEBUG: AuthContext - Fetching user profile for:', userId);
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', userId);

      const roles = userRoles?.map((ur: any) => ur.roles.name) || [];
      console.log('DEBUG: AuthContext - User roles:', roles);

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('DEBUG: AuthContext - User profile:', userProfile);
      const userData = {
        ...session?.user,
        ...userProfile,
        roles,
      };
      console.log('DEBUG: AuthContext - Setting user data:', userData);
      setUser(userData as UserProfile);
    } catch (error) {
      console.error('DEBUG: AuthContext - Error fetching user profile:', error);
    } finally {
      console.log('DEBUG: AuthContext - Setting loading to false');
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    console.log('DEBUG: AuthContext - Sign in API_URL:', API_URL);
    console.log('DEBUG: AuthContext - Sign in endpoint:', `${API_URL}/auth/login`);

    try {
      console.log('DEBUG: AuthContext - Making sign in request for:', email);
      console.log('DEBUG: AuthContext - Fetch starting...');
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      console.log('DEBUG: AuthContext - Fetch completed, response received');
      console.log('DEBUG: AuthContext - Sign in response status:', response.status);
      console.log('DEBUG: AuthContext - Sign in response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.log('DEBUG: AuthContext - Sign in error response:', error);
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      console.log('DEBUG: AuthContext - Sign in success response:', data);

      console.log('DEBUG: AuthContext - Setting session after sign in:', data.session?.user?.id);
      setSession(data.session);
      if (data.user) {
        setUser(data.user as UserProfile);
        setIsLoading(false);
      }
    } catch (error) {
      console.log('DEBUG: AuthContext - Sign in fetch error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
    console.log('DEBUG: AuthContext - Sign up API_URL:', API_URL);
    console.log('DEBUG: AuthContext - Sign up endpoint:', `${API_URL}/auth/register`);

    try {
      console.log('DEBUG: AuthContext - Making sign up request for:', email);
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

      console.log('DEBUG: AuthContext - Sign up response status:', response.status);
      console.log('DEBUG: AuthContext - Sign up response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.log('DEBUG: AuthContext - Sign up error response:', error);
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      console.log('DEBUG: AuthContext - Sign up success response:', data);

      console.log('DEBUG: AuthContext - Setting session after sign up:', data.session?.user?.id);
      setSession(data.session);
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error) {
      console.log('DEBUG: AuthContext - Sign up fetch error:', error);
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
