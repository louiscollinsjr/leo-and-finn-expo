import 'react-native-url-polyfill/auto';
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

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
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
  );
}
