import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Purchases from 'react-native-purchases';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RevenueCatProvider } from '@/contexts/RevenueCatContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaywallProvider } from '@/contexts/PaywallContext';
import { Colors } from '@/constants/Colors';
import env from '@/configs/env';

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
      <Stack.Screen name="recipe/[recipeId]/details" />
      <Stack.Screen name="recipe/[recipeId]/edit" />
      <Stack.Screen name="recipe/[recipeId]/start" />
      <Stack.Screen name="recipe/[recipeId]/finish" />
      <Stack.Screen name="recipe/[recipeId]/chat" />
      <Stack.Screen name="recipe/[recipeId]/share" />
      <Stack.Screen name="log/[logId]/details" />
      <Stack.Screen name="log/[logId]/comments" />
      <Stack.Screen name="search" />
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="settings/main" />
      <Stack.Screen name="settings/account/email" />
      <Stack.Screen name="settings/account/password" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="report" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(Colors.light.background);
  }, []);

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
      if (Platform.OS === 'ios' && env.REVENUECAT_API_KEY_IOS) {
        Purchases.configure({ apiKey: env.REVENUECAT_API_KEY_IOS });
      } else if (Platform.OS === 'android' && env.REVENUECAT_API_KEY_ANDROID) {
        Purchases.configure({ apiKey: env.REVENUECAT_API_KEY_ANDROID });
      }
      // Optional: Enable debug logs
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    }
  }, []);

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <RevenueCatProvider>
            <AuthProvider>
              <PaywallProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <RootLayoutNav />
                  <StatusBar style="dark" backgroundColor={Colors.light.background} />
                </ThemeProvider>
              </PaywallProvider>
            </AuthProvider>
          </RevenueCatProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}
