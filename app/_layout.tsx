import { useColorScheme } from '@/hooks/useColorScheme';
import { ReaderProvider } from '@/providers/ReaderProvider';
import { StackAuthProvider, useStackAuth } from '@/providers/StackAuthProvider';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { LibreBaskerville_400Regular, LibreBaskerville_400Regular_Italic, LibreBaskerville_700Bold } from '@expo-google-fonts/libre-baskerville';
import { Lora_400Regular, Lora_400Regular_Italic, Lora_700Bold } from '@expo-google-fonts/lora';
import { Mansalva_400Regular } from '@expo-google-fonts/mansalva';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { PatrickHandSC_400Regular } from '@expo-google-fonts/patrick-hand-sc';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { TrueSheetProvider } from '@lodev09/react-native-true-sheet';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { LogBox, Pressable, Text } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import '../global.css';

// Suppress known harmless warnings from @gorhom/bottom-sheet, expo-video, and deprecated APIs
LogBox.ignoreLogs([
  "Couldn't find the scrollable node handle id!",
  "Sending `onAnimatedValueUpdate` with no listeners registered",
  "Error pausing video on cleanup",
  "SafeAreaView has been deprecated",
  "VisionKitCore",
]);

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
    // Google Fonts for testing
    'LibreBaskerville-Regular': LibreBaskerville_400Regular,
    'LibreBaskerville-Italic': LibreBaskerville_400Regular_Italic,
    'LibreBaskerville-Bold': LibreBaskerville_700Bold,
    'Lora-Regular': Lora_400Regular,
    'Lora-Italic': Lora_400Regular_Italic,
    'Lora-Bold': Lora_700Bold,
    'Mansalva-Regular': Mansalva_400Regular,
    'PatrickHand-Regular': PatrickHand_400Regular,
    'PatrickHandSC-Regular': PatrickHandSC_400Regular,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TrueSheetProvider>
          <BottomSheetModalProvider>
            <StackAuthProvider>
              <RootLayoutInner />
            </StackAuthProvider>
          </BottomSheetModalProvider>
        </TrueSheetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
