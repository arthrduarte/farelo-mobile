import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
    </SafeAreaProvider>
  );
} 