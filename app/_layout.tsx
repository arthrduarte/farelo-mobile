import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Easing, Platform } from 'react-native';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { superwallService } from '@/lib/superwall';
import { useColorScheme } from '@/hooks/useColorScheme';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // keep data “fresh” for 5 minutes
        staleTime: 1000 * 60 * 5,
        // retry failed requests twice
        retry: 2,
      },
    },
  });

  useEffect(() => {
    if (Platform.OS !== 'web') {
      superwallService.initialize();
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
        <AuthProvider>
          <OnboardingProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="+not-found" />
              <Stack.Screen
                name="new-recipe"
                options={{
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="[recipeId]/details"
                options={{
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="[recipeId]/edit"
                options={{
                  presentation: 'modal',
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
          </OnboardingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
