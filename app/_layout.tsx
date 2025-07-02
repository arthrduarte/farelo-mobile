import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Easing, Platform } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Purchases from 'react-native-purchases';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RevenueCatProvider } from '@/contexts/RevenueCatContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaywallProvider } from '@/contexts/PaywallContext';

const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
const REVENUECAT_ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/onboarding');
    } else {
      router.replace('/');
    }
  }, [user, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="new-recipe" options={{ presentation: 'modal' }} />
      <Stack.Screen name="recipe/[recipeId]/details"/>
      <Stack.Screen name="recipe/[recipeId]/edit"/>
      <Stack.Screen name="recipe/[recipeId]/start"/>
      <Stack.Screen name="recipe/[recipeId]/finish"/>
      <Stack.Screen name="recipe/[recipeId]/chat"/>
      <Stack.Screen name="recipe/[recipeId]/share"/>
      <Stack.Screen name="log/[logId]/details"/>
      <Stack.Screen name="log/[logId]/comments"/>
      <Stack.Screen name="search"/>
      <Stack.Screen name="profile/[id]"/>
      <Stack.Screen name="profile/edit"/>
      <Stack.Screen name="settings/main"/>
      <Stack.Screen name="settings/account/email"/>
      <Stack.Screen name="settings/account/password"/>
      <Stack.Screen name="report"/>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // keep data "fresh" for 5 minutes
        staleTime: 1000 * 60 * 5,
        // retry failed requests twice
        retry: 2,
      },
    },
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // superwallService.initialize(); // Superwall removed
      if (Platform.OS === 'ios' && REVENUECAT_IOS_API_KEY) {
        Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
      } else if (Platform.OS === 'android' && REVENUECAT_ANDROID_API_KEY) {
        Purchases.configure({ apiKey: REVENUECAT_ANDROID_API_KEY });
      }
      // Optional: Enable debug logs
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RevenueCatProvider>
          <AuthProvider>
            <PaywallProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <RootLayoutNav />
                <StatusBar style="auto" />
              </ThemeProvider>
            </PaywallProvider>
          </AuthProvider>
        </RevenueCatProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
