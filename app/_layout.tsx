import { useColorScheme } from '@/hooks/useColorScheme';
import { ReaderProvider } from '@/providers/ReaderProvider';
import { StackAuthProvider, useStackAuth } from '@/providers/StackAuthProvider';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Mansalva_400Regular } from '@expo-google-fonts/mansalva';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Pressable, Text } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import '../global.css';

// Inner component that can use auth hooks
function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, loading } = useStackAuth();

  // Navigate based on auth state
  React.useEffect(() => {
    if (loading) return;
    
    // TODO: Implement proper navigation based on auth state
    // For now, we'll let the app handle this in individual screens
  }, [user, loading, router]);

  // Complete Web auth sessions (no-op on native)
  WebBrowser.maybeCompleteAuthSession();

  return (
    <ReaderProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="auth/email" options={{ presentation: 'modal', title: 'Log in or sign up' }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="reader/[storyId]" options={{ headerShown: false }} />
          <Stack.Screen
            name="account"
            options={{
              presentation: 'modal',
              title: 'Account',
              headerRight: () => (
                <Link href=".." replace asChild>
                  <Pressable accessibilityRole="button" hitSlop={8} style={{ paddingHorizontal: 8 }}>
                    <Text style={{ color: '#2563eb', fontSize: 16, fontWeight: '600' }}>Done</Text>
                  </Pressable>
                </Link>
              ),
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ReaderProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Mansalva_400Regular });
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Inter families
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
    // Tisa Sans Pro families
    'TisaSansPro-Regular': require('../assets/fonts/tisa-sans-pro/Tisa Sans Pro Regular.ttf'),
    'TisaSansPro-Medium': require('../assets/fonts/tisa-sans-pro/Tisa Sans Pro Medium.ttf'),
    'TisaSansPro-Bold': require('../assets/fonts/tisa-sans-pro/Tisa Sans Pro Bold.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StackAuthProvider>
            <RootLayoutInner />
          </StackAuthProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
