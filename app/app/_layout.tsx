import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { SubscriptionProvider } from "../context/SubscriptionContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { resolvedTheme } = useTheme();
  const { user, userProfile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";
    const isVerificationScreen = segments[1] === "verify";
    const isSetupScreen = segments[1] === "setup" || segments[1] === "welcome";
    const isPaywallScreen = segments[0] === "paywall";

    if (!user && (!inAuthGroup || isSetupScreen || isVerificationScreen)) {
      // Redirect to onboarding if unauthenticated — including screens that
      // require a signed-in user (setup, welcome, verify) even though they
      // sit inside the (auth) group.
      router.replace("/(auth)/onboarding");
    } else if (user) {
      const isEmailPasswordUser = user.providerData?.some(
        (p) => p.providerId === "password"
      );

      if (isEmailPasswordUser && !user.emailVerified) {
        // Only email/password accounts need email verification.
        // Social sign-in (Apple, Google) are already verified by the provider.
        if (!inAuthGroup || !isVerificationScreen) {
          router.replace("/(auth)/verify");
        }
      } else {
        // Verified (or social sign-in). Check if they completed onboarding.
        if (userProfile && !userProfile.hasCompletedOnboarding) {
          if ((!inAuthGroup || !isSetupScreen) && !isPaywallScreen) {
            router.replace("/(auth)/welcome" as any);
          }
        } else if (userProfile?.hasCompletedOnboarding) {
          if (inAuthGroup) {
            router.replace("/(tabs)");
          }
        }
      }
    }
  }, [user, userProfile, loading, segments]);

  return (
    <NavThemeProvider value={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="invoice/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="preview" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="privacy-security"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="paywall" options={{ headerShown: false }} />
      </Stack>
    </NavThemeProvider>
  );
}
