import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail fast to avoid constructing a client with invalid config.
  throw new Error(
    'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

// AppState listener for token auto-refresh
const handleAppStateChange = (state: string) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
};

let appStateSub: { remove?: () => void } | null = null;

// Start/stop token auto-refresh based on app foreground state
if (Platform.OS !== 'web') {
  if (!appStateSub) {
    // New RN API returns a subscription with remove()
    // Older API requires removeEventListener; we store handler for fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appStateSub = AppState.addEventListener('change', handleAppStateChange as any);
  }
}

// Expose a teardown to remove the listener (useful for manual cleanup or tests)
export function removeSupabaseAppStateListener() {
  if (appStateSub && typeof appStateSub.remove === 'function') {
    appStateSub.remove();
    appStateSub = null;
  } else {
    // Fallback for older RN versions
    // @ts-ignore - removeEventListener exists on older RN
    if ((AppState as any).removeEventListener) {
      // @ts-ignore
      (AppState as any).removeEventListener('change', handleAppStateChange);
    }
  }
}
