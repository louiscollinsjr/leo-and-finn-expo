import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

export const redirectTo = makeRedirectUri({ path: 'auth/callback' });

export async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  // PKCE flow: exchange `code` for a session
  const code = (params?.code ?? params?.['authorization_code']) as string | undefined;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  }

  // Legacy: access_token / refresh_token
  const access_token = params?.access_token as string | undefined;
  const refresh_token = params?.refresh_token as string | undefined;
  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw error;
    return data.session;
  }
}

export async function startOAuth(provider: 'apple' | 'google') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo);
  if (res.type === 'success' && res.url) {
    await createSessionFromUrl(res.url);
  }
}

export type EmailSignInMode = 'magic-link' | 'otp';

export async function sendMagicLink(email: string): Promise<{ mode: EmailSignInMode }> {
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;
    return { mode: 'magic-link' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
  return { mode: 'otp' };
}

export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
