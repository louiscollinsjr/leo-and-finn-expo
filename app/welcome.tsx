import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { startOAuth } from '@/lib/auth';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const insets = useSafeAreaInsets();
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ['42%'], []);

  React.useEffect(() => {
    const t = setTimeout(() => sheetRef.current?.present(), 60);
    return () => clearTimeout(t);
  }, []);

  const closeSheetToGuest = () => {
    sheetRef.current?.dismiss();
    // Navigate to Home in guest mode
    router.replace('/(tabs)/home');
  };

  const onOAuth = async (provider: 'apple' | 'google') => {
    try {
      await startOAuth(provider);
      router.replace('/(tabs)/home');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#000' : '#fff' }]}> 
      {/* Header with right-aligned Close */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: Math.max(insets.top, 8) + 16,
          height: Math.max(insets.top, 8) + 64,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingHorizontal: 36,
          zIndex: 100,
          backgroundColor: theme === 'dark' ? '#000' : '#ffffff',
        }}
      >
        <Pressable
          onPress={closeSheetToGuest}
          accessibilityRole="button"
          accessibilityLabel="Close"
         
          hitSlop={12}
          style={({ pressed }) => [{
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <View
            style={{
              backgroundColor: Colors[theme].chip,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme === 'dark' ? '#3a3b3d' : '#64748b',
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2,
            }}
          >
            <MaterialIcons name="close" size={20} color={Colors[theme].text} />
          </View>
        </Pressable>
      </View>

      {/* Hero */}
      <View style={[styles.hero, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[styles.heroText, { color: Colors[theme].text }]}></Text>
        <View style={[styles.dot, { backgroundColor: Colors[theme].text }]} />
      </View>

      {/* Bottom Sheet */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#111111', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        handleComponent={null}
        enableHandlePanningGesture={false}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <View style={{ gap: 12, marginTop: 4,marginBottom: 16 }}>
            <Pressable onPress={() => onOAuth('apple')} style={[styles.btn, styles.appleBtn]}>
              <Ionicons name="logo-apple" size={18} color="#111827" style={{ marginRight: 8 }} />
              <Text style={[styles.btnText, { color: '#111827' }]}>Continue with Apple</Text>
            </Pressable>

            <Pressable onPress={() => onOAuth('google')} style={[styles.btn, styles.googleBtn]}>
              <Ionicons name="logo-google" size={18} color="#ea4335" style={{ marginRight: 8 }} />
              <Text style={[styles.btnText, { color: '#ffffff' }]}>Continue with Google</Text>
            </Pressable>

            {/* Single entry point for email magic link */}
            <Pressable onPress={() => router.push('/auth/email')} style={[styles.btn, styles.loginBtn]}>
              <Text style={[styles.btnText, { color: '#ffffff' }]}>Log in</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroText: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  dot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    bottom: 32,
    right: 26,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  btnText: {
    fontSize: 20,
    fontWeight: '600',
  },
  appleBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  googleBtn: {
    backgroundColor: '#2b2c2e',
  },
  loginBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2b2c2d',
  },
});
