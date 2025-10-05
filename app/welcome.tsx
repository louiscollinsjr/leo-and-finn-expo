import { Colors } from "@/constants/Colors";
import {
  DarkBackgrounds,
  LightBackgrounds,
} from "@/constants/welcomeBackgrounds";
import { useColorScheme } from "@/hooks/useColorScheme";
import { startOAuth } from "@/lib/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Button, Host, Image as SwiftUIImage } from "@expo/ui/swift-ui";
import { clipShape, frame, glassEffect } from "@expo/ui/swift-ui/modifiers";

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const insets = useSafeAreaInsets();
  const sheetRef = React.useRef<BottomSheetModal>(null);
  const snapPoints = React.useMemo(() => ["42%"], []);

  // Pick a background image once per mount for stability
  const list = theme === "dark" ? DarkBackgrounds : LightBackgrounds;
  const backgroundSource = React.useMemo(
    () => list[Math.floor(Math.random() * list.length)],
    [list]
  );

  React.useEffect(() => {
    const t = setTimeout(() => sheetRef.current?.present(), 60);
    return () => clearTimeout(t);
  }, []);

  const closeSheetToGuest = () => {
    sheetRef.current?.dismiss();
    // Navigate to Home in guest mode
    router.replace("/(tabs)/home");
  };

  const onOAuth = async (provider: "apple" | "google") => {
    try {
      await startOAuth(provider);
      router.replace("/(tabs)/home");
    } catch (e) {
      console.warn(e);
      // Show user-friendly error message
      const errorMessage =
        e instanceof Error ? e.message : "An unexpected error occurred";
      Alert.alert(
        "Sign in failed",
        `Unable to sign in with ${provider}. ${errorMessage}`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#000" : "#fff" },
      ]}
    >
      {/* Background image */}
      <Image
        source={backgroundSource}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={200}
      />
      {/* Scrim for readability */}
      <LinearGradient
        colors={
          theme === "dark"
            ? ["rgba(0,0,0,0.45)", "rgba(0,0,0,0.15)"]
            : ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.00)"]
        }
        style={StyleSheet.absoluteFillObject}
      />
      {/* Header with right-aligned Close */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: Math.max(insets.top, 8) + 16,
          height: Math.max(insets.top, 8) + 64,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingHorizontal: 36,
          zIndex: 100,
          backgroundColor: "transparent",
        }}
      >
        <Host matchContents>
          <Button
            variant="glass"
            onPress={closeSheetToGuest}
            modifiers={[
              frame({ width: 48, height: 48 }),
              clipShape("circle"),
              glassEffect({ glass: { variant: "regular" } }),
            ]}
          >
            <SwiftUIImage systemName="xmark" size={20} />
          </Button>
        </Host>
      </View>

      {/* Hero */}
      <View
        style={[
          styles.hero,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={[styles.heroText, { color: Colors[theme].text }]}>

        </Text>
      </View>

      {/* Bottom Sheet */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: "#111111",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          opacity: 0.9,
        }}
        handleComponent={null}
        enableHandlePanningGesture={false}
      >
        <BottomSheetView style={{ padding: 20 }}>
          <View style={{ gap: 12, marginTop: 4, marginBottom: 16 }}>
            <Pressable
              onPress={() => onOAuth("apple")}
              style={[styles.btn, styles.appleBtn]}
            >
              <Ionicons
                name="logo-apple"
                size={18}
                color="#111827"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.btnText, { color: "#111827" }]}>
                Continue with Apple
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onOAuth("google")}
              style={[styles.btn, styles.googleBtn]}
            >
              <Ionicons
                name="logo-google"
                size={18}
                color="#ea4335"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.btnText, { color: "#ffffff" }]}>
                Continue with Google
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/auth/email")}
              style={[styles.btn, styles.loginBtn]}
            >
              <Text style={[styles.btnText, { color: "#ffffff" }]}>Log in</Text>
            </Pressable>

            {/* Guest mode */}
            <Pressable
              onPress={closeSheetToGuest}
              style={[styles.btn, styles.loginBtn]}
            >
              <Text style={[styles.btnText, { color: "#ffffff" }]}>
                Continue as guest
              </Text>
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
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroText: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  dot: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    bottom: 32,
    right: 26,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  btnText: {
    fontSize: 20,
    fontWeight: "600",
  },
  appleBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  googleBtn: {
    backgroundColor: "#2b2c2e",
  },
  loginBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#2b2c2d",
  },
});
