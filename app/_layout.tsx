import 'react-native-url-polyfill/auto';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Mansalva_400Regular } from '@expo-google-fonts/mansalva';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, Text } from 'react-native';
import '../global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({ Mansalva_400Regular });
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="reader/[storyId]" options={{ title: 'Reader' }} />
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
  );
}
