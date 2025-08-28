import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { sendMagicLink, startOAuth } from '@/lib/auth';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function EmailAuthScreen() {
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState<null | 'email' | 'apple' | 'google'>(null);
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';

  const onContinue = async () => {
    try {
      if (!email.trim()) return;
      setBusy('email');
      await sendMagicLink(email.trim());
      Alert.alert('Check your email', 'We sent you a magic link to continue.');
    } catch (e) {
      Alert.alert('Error', 'Unable to send magic link');
      console.warn(e);
    } finally {
      setBusy(null);
    }
  };

  const onOAuth = async (provider: 'apple' | 'google') => {
    try {
      setBusy(provider);
      await startOAuth(provider);
      router.replace('/(tabs)/home');
    } catch (e) {
      console.warn(e);
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#111827' }]}>Log in or sign up</Text>
      </View>

      <View style={styles.content}>
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
        <Pressable onPress={onContinue} disabled={!email.trim() || busy === 'email'} style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.8 : 1 }] }>
          <Text style={styles.primaryBtnText}>{busy === 'email' ? 'Sending…' : 'Continue'}</Text>
        </Pressable>

        <View style={styles.orRow}>
          <View style={styles.hr} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.hr} />
        </View>

        <View style={{ gap: 10 }}>
          <Pressable onPress={() => onOAuth('google')} style={[styles.altBtn, { backgroundColor: '#111827' }]}>
            <Text style={[styles.altBtnText, { color: '#fff' }]}>Continue with Google</Text>
          </Pressable>
          <Pressable onPress={() => onOAuth('apple')} style={[styles.altBtn, { backgroundColor: '#111827' }]}>
            <Text style={[styles.altBtnText, { color: '#fff' }]}>Continue with Apple</Text>
          </Pressable>
        </View>
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
    // Color will be set dynamically
  },
  primaryBtn: { backgroundColor: '#111827', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  hr: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  orText: { color: '#6b7280', fontWeight: '700', fontSize: 12 },
  altBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  altBtnText: { fontWeight: '700' },
});
