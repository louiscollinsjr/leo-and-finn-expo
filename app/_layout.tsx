import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Mansalva_400Regular } from '@expo-google-fonts/mansalva';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ReaderProvider } from '@/providers/ReaderProvider';
import { Pressable, Text } from 'react-native';
import '../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createSessionFromUrl } from '@/lib/auth';

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
      <BottomSheetModalProvider>
        <ReaderProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
    </GestureHandlerRootView>
  );
}
