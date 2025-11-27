/**
 * Stack Auth client for React Native / Expo.
 * 
 * Complete implementation with:
 * - Token storage (AsyncStorage for now, switch to SecureStore after native rebuild)
 * - OAuth flow (Google/Apple)
 * - Magic link / OTP flow
 * - Token refresh
 * 
 * TODO: Switch to expo-secure-store after running `npx expo prebuild` or `eas build`
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_ID = process.env.EXPO_PUBLIC_STACK_PROJECT_ID;
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STACK_PUBLISHABLE_KEY;

// Stack Auth API base URL
const STACK_API_BASE = 'https://api.stack-auth.com/api/v1';

// Deep link scheme for OAuth callback
export const AUTH_REDIRECT_URI = process.env.EXPO_PUBLIC_STACK_REDIRECT_URL ||
  'https://auth.atem.gdn/redirect';

// Secure storage keys
const ACCESS_TOKEN_KEY = 'stack_access_token';
const REFRESH_TOKEN_KEY = 'stack_refresh_token';
const USER_ID_KEY = 'stack_user_id';

if (!PROJECT_ID || !PUBLISHABLE_KEY) {
  console.warn(
    '[Stack Auth] Missing env vars. Set EXPO_PUBLIC_STACK_PROJECT_ID and EXPO_PUBLIC_STACK_PUBLISHABLE_KEY.'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StackTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type StackUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
};

export type AuthResult = {
  user: StackUser;
  tokens: StackTokens;
};

// ─────────────────────────────────────────────────────────────────────────────
// Token Storage (using AsyncStorage - switch to SecureStore after native rebuild)
// ─────────────────────────────────────────────────────────────────────────────

async function saveTokens(tokens: StackTokens): Promise<void> {
  try {
    const promises: Promise<void>[] = [
      AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
    ];
    // Only save refresh token if it exists
    if (tokens.refreshToken) {
      promises.push(AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken));
    }
    await Promise.all(promises);
    console.log('[Stack Auth] Tokens saved');
  } catch (e) {
    console.error('[Stack Auth] Failed to save tokens', e);
    throw e;
  }
}

async function getTokens(): Promise<StackTokens | null> {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem(ACCESS_TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_TOKEN_KEY),
    ]);
    if (accessToken) {
      return { accessToken, refreshToken: refreshToken ?? undefined };
    }
    return null;
  } catch (e) {
    console.error('[Stack Auth] Failed to get tokens', e);
    return null;
  }
}

async function clearTokens(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_ID_KEY),
    ]);
    console.log('[Stack Auth] Tokens cleared');
  } catch (e) {
    console.error('[Stack Auth] Failed to clear tokens', e);
  }
}

async function saveUserId(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
  } catch (e) {
    console.error('[Stack Auth] Failed to save user ID', e);
  }
}

async function getUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (e) {
    console.error('[Stack Auth] Failed to get user ID', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Stack-Project-Id': PROJECT_ID!,
    'X-Stack-Publishable-Client-Key': PUBLISHABLE_KEY!,
    'X-Stack-Access-Type': 'client',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${STACK_API_BASE}${endpoint}`;
  console.log('[Stack Auth] Request:', options.method || 'GET', url);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  console.log('[Stack Auth] Response status:', response.status);

  if (!response.ok) {
    const text = await response.text();
    console.error('[Stack Auth] API error response:', response.status, text);
    let error: any;
    try {
      error = JSON.parse(text);
    } catch {
      error = { message: text || `API error: ${response.status}` };
    }
    throw new Error(error.message || error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// OAuth Flow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the OAuth authorization URL for a provider.
 * Stack Auth uses /auth/oauth/authorize/{provider} endpoint
 */
export function buildOAuthUrl(provider: 'google' | 'apple'): string {
  const params = new URLSearchParams({
    client_id: PROJECT_ID!,
    redirect_uri: AUTH_REDIRECT_URI,
    response_type: 'code',
  });
  return `${STACK_API_BASE}/auth/oauth/authorize/${provider}?${params.toString()}`;
}

/**
 * Exchange OAuth authorization code for tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<AuthResult> {
  const response = await apiRequest<{
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      primary_email: string | null;
      display_name: string | null;
      profile_image_url: string | null;
    };
  }>('/auth/oauth/token', {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: AUTH_REDIRECT_URI,
    }),
  });

  const tokens: StackTokens = {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
  };

  // Save tokens securely
  await saveTokens(tokens);
  if (response.user) {
    await saveUserId(response.user.id);
  }

  const user: StackUser = {
    id: response.user.id,
    email: response.user.primary_email,
    displayName: response.user.display_name,
    profileImageUrl: response.user.profile_image_url,
  };

  return { user, tokens };
}

// ─────────────────────────────────────────────────────────────────────────────
// Magic Link / OTP Flow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a sign-in OTP code to the user's email.
 */
export async function sendMagicLink(email: string): Promise<string> {
  const response = await apiRequest<{ nonce: string }>('/auth/otp/send-sign-in-code', {
    method: 'POST',
    body: JSON.stringify({
      email,
      callback_url: AUTH_REDIRECT_URI,
    }),
  });
  console.log('[Stack Auth] OTP sent to', email);
  return response.nonce;
}

/**
 * Verify the OTP code and get tokens.
 */
export async function verifyOtp(email: string, code: string, nonce: string): Promise<AuthResult> {
  const response = await apiRequest<{
    access_token: string;
    refresh_token: string;
    user_id?: string;
    user?: {
      id: string;
      primary_email: string | null;
      display_name: string | null;
      profile_image_url: string | null;
    };
  }>('/auth/otp/sign-in', {
    method: 'POST',
    body: JSON.stringify({
      code: `${code}${nonce}`,
    }),
  });

  const tokens: StackTokens = {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
  };

  // Persist tokens
  await saveTokens(tokens);
  if (response.user_id) {
    await saveUserId(response.user_id);
  }

  const user: StackUser = response.user
    ? {
        id: response.user.id,
        email: response.user.primary_email,
        displayName: response.user.display_name,
        profileImageUrl: response.user.profile_image_url,
      }
    : {
        id: response.user_id ?? (await getUserId()) ?? 'unknown',
        email: email ?? null,
        displayName: null,
        profileImageUrl: null,
      };

  return { user, tokens };
}

// ─────────────────────────────────────────────────────────────────────────────
// Token Refresh
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Refresh the access token using the refresh token.
 */
export async function refreshAccessToken(): Promise<StackTokens | null> {
  const currentTokens = await getTokens();
  if (!currentTokens?.refreshToken) {
    console.log('[Stack Auth] No refresh token available');
    return null;
  }

  try {
    const response = await apiRequest<{
      access_token: string;
      refresh_token: string;
    }>('/auth/sessions/current/refresh', {
      method: 'POST',
      headers: {
        'X-Stack-Refresh-Token': currentTokens.refreshToken,
      },
      body: JSON.stringify({}),
    });

    const newTokens: StackTokens = {
      accessToken: response.access_token,
      // Keep existing refresh token if API doesn't return a new one
      refreshToken: response.refresh_token || currentTokens.refreshToken,
    };

    await saveTokens(newTokens);
    console.log('[Stack Auth] Tokens refreshed');
    return newTokens;
  } catch (e) {
    console.error('[Stack Auth] Token refresh failed', e);
    // Clear invalid tokens
    await clearTokens();
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the current user from the API.
 */
export async function getCurrentUser(): Promise<StackUser | null> {
  const tokens = await getTokens();
  if (!tokens?.accessToken) {
    return null;
  }

  try {
    const response = await apiRequest<{
      id: string;
      primary_email: string | null;
      display_name: string | null;
      profile_image_url: string | null;
    }>('/users/me', {
      headers: {
        'X-Stack-Access-Token': tokens.accessToken,
      },
    });

    return {
      id: response.id,
      email: response.primary_email,
      displayName: response.display_name,
      profileImageUrl: response.profile_image_url,
    };
  } catch (e) {
    console.error('[Stack Auth] Failed to get current user', e);
    // Try refreshing the token
    const newTokens = await refreshAccessToken();
    if (newTokens) {
      return getCurrentUser(); // Retry with new token
    }
    return null;
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const tokens = await getTokens();
  
  // Try to invalidate the session on the server
  if (tokens?.accessToken) {
    try {
      await apiRequest('/auth/sessions/current', {
        method: 'DELETE',
        headers: {
          'X-Stack-Access-Token': tokens.accessToken,
        },
      });
    } catch (e) {
      // Ignore errors - we'll clear local tokens anyway
      console.warn('[Stack Auth] Failed to invalidate session on server', e);
    }
  }

  // Always clear local tokens
  await clearTokens();
  console.log('[Stack Auth] Signed out');
}

// ─────────────────────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize Stack Auth - check for existing session.
 */
export async function initialize(): Promise<StackUser | null> {
  console.log('[Stack Auth] Initializing...');
  
  const tokens = await getTokens();
  if (!tokens) {
    console.log('[Stack Auth] No stored tokens');
    return null;
  }

  // Try to get the current user
  const user = await getCurrentUser();
  if (user) {
    console.log('[Stack Auth] Restored session for', user.email);
  }
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// Export consolidated API
// ─────────────────────────────────────────────────────────────────────────────

export const stackAuth = {
  // Config
  projectId: PROJECT_ID,
  redirectUri: AUTH_REDIRECT_URI,
  
  // Token management
  getTokens,
  saveTokens,
  clearTokens,
  refreshAccessToken,
  
  // OAuth
  buildOAuthUrl,
  exchangeCodeForTokens,
  
  // Magic link / OTP
  sendMagicLink,
  verifyOtp,
  
  // User
  getCurrentUser,
  signOut,
  
  // Initialization
  initialize,
};
