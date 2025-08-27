import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, Pressable, TextInput, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/hooks/useAuth';
import { startOAuth, sendMagicLink } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ marginTop: 24, marginBottom: 8, marginHorizontal: 16, fontSize: 12, fontWeight: '600', color: '#6b7280' }}>
      {children}
    </Text>
  );
}

function ListItem({
  title,
  subtitle,
  icon,
  onPress,
  trailingChevron = true,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  trailingChevron?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.6 : 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
      })}
    >
      {icon ? (
        <MaterialIcons name={icon} size={22} color="#111827" style={{ marginRight: 12, opacity: 0.9 }} />
      ) : (
        <View style={{ width: 22, marginRight: 12 }} />
      )}

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: '#111827' }}>{title}</Text>
        {subtitle ? (
          <Text style={{ marginTop: 2, fontSize: 12, color: '#6b7280' }}>{subtitle}</Text>
        ) : null}
      </View>

      {trailingChevron ? (
        <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
      ) : null}
    </Pressable>
  );
}

export default function AccountScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState<'apple' | 'google' | 'email' | 'signout' | null>(null);

  // On sign-in, close the modal
  React.useEffect(() => {
    if (user) router.back();
  }, [user]);

  const onApple = async () => {
    try {
      setBusy('apple');
      await startOAuth('apple');
    } catch (e) {
      console.warn(e);
    } finally {
      setBusy(null);
    }
  };
  const onGoogle = async () => {
    try {
      setBusy('google');
      await startOAuth('google');
    } catch (e) {
      console.warn(e);
    } finally {
      setBusy(null);
    }
  };
  const onMagic = async () => {
    try {
      if (!email.trim()) return;
      setBusy('email');
      await sendMagicLink(email.trim());
      alert('Magic link sent. Check your email.');
    } catch (e) {
      console.warn(e);
      alert('Failed to send magic link.');
    } finally {
      setBusy(null);
    }
  };

  const onSignOut = async () => {
    try {
      setBusy('signout');
      await supabase.auth.signOut();
      // After sign out, go to Welcome screen
      router.replace('/welcome');
    } catch (e) {
      console.warn(e);
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#f4f5f7' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View
          style={{
            marginTop: 12,
            marginHorizontal: 16,
            borderRadius: 14,
            backgroundColor: '#ffffff',
            padding: 16,
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                borderWidth: 1,
                borderColor: '#d1d5db',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <MaterialIcons name="person" size={26} color="#111827" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                {user?.email ?? 'Guest'}
              </Text>
              <Text style={{ marginTop: 2, fontSize: 12, color: '#6b7280' }}>
                {user ? 'Signed in' : 'Not signed in'}
              </Text>
            </View>
            {user ? (
              <Pressable onPress={onSignOut} disabled={busy === 'signout'}>
                <Text style={{ color: '#ef4444', fontWeight: '600' }}>
                  {busy === 'signout' ? 'Signing out…' : 'Sign Out'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* My Purchases */}
        <SectionHeader>MY PURCHASES</SectionHeader>
        <View style={{ marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <ListItem title="Updates" icon="system-update" trailingChevron={false} />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Books" icon="book" />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Audiobooks" icon="headset" />
        </View>

        {/* Family Purchases */}
        <SectionHeader>FAMILY PURCHASES</SectionHeader>
        <View style={{ marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <ListItem title="Family Purchases" icon="group" />
        </View>

        {/* Sign in options */}
        {!user ? (
          <View style={{ marginTop: 24, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
            <ListItem
              title="Continue with Apple"
              icon="login"
              trailingChevron={false}
              onPress={onApple}
            />
            <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
            <ListItem
              title="Continue with Google"
              icon="login"
              trailingChevron={false}
              onPress={onGoogle}
            />
            <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={{ fontSize: 14, color: '#111827', marginBottom: 8 }}>Continue with Email</Text>
              <TextInput
                placeholder="name@example.com"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 16,
                  color: '#111827',
                }}
              />
              <Pressable
                onPress={onMagic}
                disabled={!email.trim() || busy === 'email'}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: '#111827',
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginTop: 10,
                })}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {busy === 'email' ? 'Sending…' : 'Send Magic Link'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Other settings */}
        <View style={{ marginTop: 24, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', backgroundColor: '#ffffff' }}>
          <ListItem title="Notifications" icon="notifications" />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Manage Hidden Purchases" icon="visibility-off" subtitle="Unhide books you've hidden." trailingChevron={false} />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Redeem Gift Card or Code" icon="card-giftcard" />
          <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />
          <ListItem title="Account Settings" icon="settings" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
