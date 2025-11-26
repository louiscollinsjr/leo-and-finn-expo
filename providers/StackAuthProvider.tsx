/**
 * Stack Auth Provider for React Native / Expo.
 * 
 * Provides authentication context using Stack Auth.
 * Wraps the app to provide user state and auth methods.
 */

import {
    stackAuth,
    initialize as stackInitialize,
    signOut as stackSignOut,
    type StackUser,
} from '@/lib/stack';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// Auth context type
type StackAuthContextType = {
  user: StackUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const StackAuthContext = createContext<StackAuthContextType | null>(null);

type StackAuthProviderProps = {
  children: ReactNode;
};

export function StackAuthProvider({ children }: StackAuthProviderProps) {
  const [user, setUser] = useState<StackUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        console.log('[StackAuthProvider] Initializing...');
        const currentUser = await stackInitialize();
        if (isMounted) {
          setUser(currentUser);
          console.log('[StackAuthProvider] User:', currentUser?.email ?? 'none');
        }
      } catch (e) {
        console.error('[StackAuthProvider] Init error', e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await stackAuth.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      console.error('[StackAuthProvider] Refresh error', e);
    }
  }, []);

  // Sign out handler
  const signOut = useCallback(async () => {
    try {
      await stackSignOut();
      setUser(null);
    } catch (e) {
      console.error('[StackAuthProvider] Sign out error', e);
      // Still clear local state even if server call fails
      await stackAuth.clearTokens();
      setUser(null);
    }
  }, []);

  const value: StackAuthContextType = {
    user,
    loading,
    signOut,
    refreshUser,
  };

  return (
    <StackAuthContext.Provider value={value}>
      {children}
    </StackAuthContext.Provider>
  );
}

// Hook to use Stack Auth
export function useStackAuth() {
  const context = useContext(StackAuthContext);
  if (!context) {
    throw new Error('useStackAuth must be used within a StackAuthProvider');
  }
  return context;
}

// Compatibility hook that matches the old useAuth interface
export function useAuth() {
  const { user, loading } = useStackAuth();
  
  // Map Stack Auth user to a compatible format
  return {
    user: user ? {
      id: user.id,
      email: user.email ?? undefined,
    } : null,
    session: user ? { user } : null,
    loading,
  };
}
