/**
 * Authentication functions using Stack Auth.
 * 
 * Complete implementation for React Native with:
 * - OAuth (Google/Apple) via WebBrowser
 * - Magic link / OTP via email
 * - Deep link handling for callbacks
 */

import {
    AUTH_REDIRECT_URI,
    buildOAuthUrl,
    exchangeCodeForTokens,
    stackAuth,
    getCurrentUser as stackGetCurrentUser,
    sendMagicLink as stackSendMagicLink,
    signOut as stackSignOut,
    verifyOtp as stackVerifyOtp,
    type AuthResult,
    type StackUser,
} from '@/lib/stack';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

// ─────────────────────────────────────────────────────────────────────────────
// OAuth Flow
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Start OAuth flow for Google or Apple.
 * Opens the browser, handles the redirect, and exchanges the code for tokens.
 */
export async function startOAuth(provider: 'apple' | 'google'): Promise<AuthResult> {
  if (!stackAuth.projectId) {
    throw new Error('Stack Auth not configured');
  }

  // Build the OAuth URL
  const authUrl = buildOAuthUrl(provider);
  console.log('[Auth] Starting OAuth for', provider);
  console.log('[Auth] Redirect URI:', AUTH_REDIRECT_URI);

  // Open the browser for OAuth
  const result = await WebBrowser.openAuthSessionAsync(authUrl, AUTH_REDIRECT_URI);

  if (result.type !== 'success') {
    throw new Error(`OAuth cancelled or failed: ${result.type}`);
  }

  // Extract the authorization code from the redirect URL
  const url = result.url;
  const { queryParams } = Linking.parse(url);
  const code = queryParams?.code as string | undefined;

  if (!code) {
    throw new Error('No authorization code in callback URL');
  }

  console.log('[Auth] Got authorization code, exchanging for tokens...');

  // Exchange the code for tokens
  const authResult = await exchangeCodeForTokens(code);
  console.log('[Auth] OAuth complete for', authResult.user.email);

  return authResult;
}

// ─────────────────────────────────────────────────────────────────────────────
// Magic Link / OTP Flow
// ─────────────────────────────────────────────────────────────────────────────

export type EmailSignInMode = 'otp';

/**
 * Send a magic link / OTP to the user's email.
 * Stack Auth uses OTP codes for React Native (not clickable links).
 */
export async function sendMagicLink(email: string): Promise<{ mode: EmailSignInMode; nonce: string }> {
  if (!stackAuth.projectId) {
    throw new Error('Stack Auth not configured');
  }

  const nonce = await stackSendMagicLink(email);
  console.log('[Auth] OTP sent to', email);

  // Stack Auth sends OTP codes for mobile apps
  return { mode: 'otp', nonce };
}

/**
 * Verify the OTP code sent to the user's email.
 */
export async function verifyEmailOtp(email: string, code: string, nonce: string): Promise<AuthResult> {
  if (!stackAuth.projectId) {
    throw new Error('Stack Auth not configured');
  }

  const result = await stackVerifyOtp(email, code, nonce);
  console.log('[Auth] OTP verified for', result.user.email);

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await stackSignOut();
}

/**
 * Get the current user.
 */
export async function getCurrentUser(): Promise<StackUser | null> {
  return stackGetCurrentUser();
}

/**
 * Get the current session (tokens).
 */
export async function getCurrentSession() {
  const tokens = await stackAuth.getTokens();
  if (!tokens) return null;

  const user = await stackGetCurrentUser();
  return user ? { user, tokens } : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deep Link Handling
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handle a deep link callback from OAuth or magic link.
 * Call this when the app receives a deep link.
 */
export async function handleAuthCallback(url: string): Promise<AuthResult | null> {
  console.log('[Auth] Handling callback URL:', url);

  const { queryParams } = Linking.parse(url);

  // OAuth callback with authorization code
  const code = queryParams?.code as string | undefined;
  if (code) {
    console.log('[Auth] Found authorization code in callback');
    return exchangeCodeForTokens(code);
  }

  // Magic link callback (if Stack Auth sends clickable links)
  // Note: Magic links use a 45-char code that doesn't need a nonce
  const token = queryParams?.token as string | undefined;
  const email = queryParams?.email as string | undefined;
  const nonce = queryParams?.nonce as string | undefined;
  if (token && email) {
    console.log('[Auth] Found magic link token in callback');
    return stackVerifyOtp(email, token, nonce ?? '');
  }

  console.log('[Auth] No auth params in callback URL');
  return null;
}
