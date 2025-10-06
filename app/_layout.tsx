import { useColorScheme } from '@/hooks/useColorScheme';
import { createSessionFromUrl } from '@/lib/auth';
import { ReaderProvider } from '@/providers/ReaderProvider';
import { supabase } from '@/lib/supabase';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Mansalva_400Regular } from '@expo-google-fonts/mansalva';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { Link, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Pressable, Text } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
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

  // Session listener for auth state changes
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Navigate to home screen when user signs in
        router.replace('/(tabs)/home');
      } else if (event === 'SIGNED_OUT') {
        // Navigate to welcome screen when user signs out
        router.replace('/welcome');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Complete Web auth sessions (no-op on native)
  WebBrowser.maybeCompleteAuthSession();

  // Handle deep link returns from OAuth/magic link
  const url = Linking.useURL();
  React.useEffect(() => {
    if (url) {
      createSessionFromUrl(url).catch(() => {
        // swallow; invalid or unrelated link
      });
    }
  }, [url]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
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
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
