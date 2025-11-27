import { useColorScheme } from '@/hooks/useColorScheme';
import { sendMagicLink, startOAuth, verifyEmailOtp } from '@/lib/auth';
import { useStackAuth } from '@/providers/StackAuthProvider';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmailAuthScreen() {
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState<null | 'email' | 'apple' | 'google' | 'verify-otp'>(null);
  const [otpRequested, setOtpRequested] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [nonce, setNonce] = React.useState<string | null>(null);
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const { setUser } = useStackAuth();

  const onContinue = async () => {
    try {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) return;
      setBusy('email');
      const { nonce } = await sendMagicLink(trimmedEmail);
      setOtpRequested(true);
      setNonce(nonce);
    } catch (e: any) {
      console.warn(e);
      let errorMessage = 'Unable to send code';
      
      if (e.message?.includes('rate limit')) {
        errorMessage = 'Too many attempts. Please wait a moment and try again.';
      } else if (e.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (e.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setBusy(null);
    }
  };

  const onOAuth = async (provider: 'apple' | 'google') => {
    try {
      setBusy(provider);
      const result = await startOAuth(provider);
      setUser(result.user);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      console.warn(e);
      let errorMessage = `Unable to sign in with ${provider}`;
      
      if (e.message?.includes('cancelled')) {
        errorMessage = `${provider} sign in was cancelled`;
      } else if (e.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Alert.alert('Sign in failed', errorMessage);
    } finally {
      setBusy(null);
    }
  };

  const onVerifyOtp = async () => {
    try {
      const trimmedEmail = email.trim();
      const code = otp.trim();
      if (!trimmedEmail || code.length < 4 || !nonce) return;
      setBusy('verify-otp');
      const result = await verifyEmailOtp(trimmedEmail, code, nonce);
      setUser(result.user);
      setOtp('');
      setOtpRequested(false);
      setNonce(null);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      console.warn(e);
      let errorMessage = 'Invalid or expired code. Please try again.';
      if (e.message?.includes('expired')) {
        errorMessage = 'This code has expired. Request a new one.';
      } else if (e.message?.includes('not found')) {
        errorMessage = 'The code you entered is incorrect. Check the email and try again.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setBusy(null);
    }
  };

  const resetEmailFlow = () => {
    setOtp('');
    setOtpRequested(false);
    setNonce(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#111827' }]}>
          Log in or sign up
        </Text>
      </View>

      <View style={styles.content}>
        {otpRequested ? (
          <View style={styles.otpContainer}>
            <Text style={[styles.otpTitle, { color: theme === 'dark' ? '#fff' : '#111827' }]}>
              Enter your code
            </Text>
            <Text style={[styles.otpHint, { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
              We sent a 6-digit code to {email}. Enter it below to continue.
            </Text>
            <TextInput
              value={otp}
              onChangeText={(value) =>
                setOtp(value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase().slice(0, 6))
              }
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={6}
              autoCapitalize="characters"
              style={[
                styles.otpInput,
                { color: theme === 'dark' ? '#ffffff' : '#111827' },
                theme === 'dark' && styles.otpInputDark,
              ]}
            />
            <TouchableOpacity
              onPress={onVerifyOtp}
              disabled={!otp.trim() || busy === 'verify-otp'}
              activeOpacity={0.7}
              style={[
                styles.primaryBtn,
                styles.primaryBtnWrapper,
                (!otp.trim() || busy === 'verify-otp') && styles.primaryBtnDisabled,
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {busy === 'verify-otp' ? 'Verifying…' : 'Verify code'}
              </Text>
            </TouchableOpacity>

            <Pressable
              onPress={onContinue}
              disabled={busy === 'email'}
              style={({ pressed }) => [styles.resendBtn, { opacity: pressed || busy === 'email' ? 0.6 : 1 }]}
            >
              <Text style={styles.resendBtnText}>
                {busy === 'email' ? 'Sending…' : 'Resend code'}
              </Text>
            </Pressable>

            <Pressable
              onPress={resetEmailFlow}
              style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={styles.backBtnText}>Use a different email</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              placeholder="name@example.com"
              placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#9ca3af'}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { color: theme === 'dark' ? '#ffffff' : '#111827' }]}
            />
            <View style={styles.primaryBtnWrapper}>
              <TouchableOpacity
                onPress={onContinue}
                disabled={!email.trim() || busy === 'email'}
                activeOpacity={0.7}
                style={[
                  styles.primaryBtn,
                  (!email.trim() || busy === 'email') && styles.primaryBtnDisabled,
                ]}
              >
                <Text style={styles.primaryBtnText}>
                  {busy === 'email' ? 'Sending…' : 'Send code'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.orRow}>
              <View style={styles.hr} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.hr} />
            </View>

            <View style={{ gap: 10 }}>
              <Pressable 
                onPress={() => onOAuth('google')} 
                disabled={busy === 'google'}
                style={({ pressed }) => [
                  styles.altBtn, 
                  { 
                    backgroundColor: '#111827',
                    opacity: pressed || busy === 'google' ? 0.6 : 1 
                  }
                ]}
              >
                <Text style={[styles.altBtnText, { color: '#fff' }]}>
                  {busy === 'google' ? 'Connecting…' : 'Continue with Google'}
                </Text>
              </Pressable>
              <Pressable 
                onPress={() => onOAuth('apple')} 
                disabled={busy === 'apple'}
                style={({ pressed }) => [
                  styles.altBtn, 
                  { 
                    backgroundColor: '#111827',
                    opacity: pressed || busy === 'apple' ? 0.6 : 1 
                  }
                ]}
              >
                <Text style={[styles.altBtnText, { color: '#fff' }]}>
                  {busy === 'apple' ? 'Connecting…' : 'Continue with Apple'}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  content: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryBtn: { backgroundColor: '#111827', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  primaryBtnWrapper: { marginTop: 12 },
  primaryBtnDisabled: { backgroundColor: '#4b5563' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  hr: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  orText: { color: '#6b7280', fontWeight: '700', fontSize: 12 },
  altBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  altBtnText: { fontWeight: '700' },
  otpContainer: { gap: 16, marginTop: 12 },
  otpTitle: { fontSize: 20, fontWeight: '700' },
  otpHint: { fontSize: 14, lineHeight: 20 },
  otpInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    fontSize: 28,
    letterSpacing: 6,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontVariant: ['tabular-nums'],
  },
  otpInputDark: {
    borderColor: '#374151',
    backgroundColor: 'rgba(55, 65, 81, 0.35)',
  },
  resendBtn: { 
    backgroundColor: '#111827', 
    borderRadius: 10, 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    alignItems: 'center',
    marginBottom: 12,
  },
  resendBtnText: { color: '#fff', fontWeight: '600' },
  backBtn: { 
    backgroundColor: 'transparent', 
    borderRadius: 10, 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  backBtnText: { color: '#6b7280', fontWeight: '600' },
});
