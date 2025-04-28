import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './AuthContext';

type OnboardingContextType = {
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'hasCompletedOnboarding';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const segments = useSegments();
  const router = useRouter();
  const { loading: authLoading, onAuthStateChange } = useAuth();

  // Handle setting onboarded status safely
  const handleSetIsOnboarded = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(value));
      setIsOnboarded(value);
    } catch (error) {
      console.error('[OnboardingContext] Error setting onboarding status:', error);
    }
  }, []);

  // Check onboarding status from storage on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        setIsOnboarded(value === 'true');
      } catch (error) {
        console.error('[OnboardingDebug] Error checking onboarding status:', error);
        setIsOnboarded(false);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // Register auth state change listener - with cleanup
  useEffect(() => {
    
    const unsubscribe = onAuthStateChange((isAuth) => {
      setIsAuthenticated(isAuth);
    });
    
    return () => {
      unsubscribe();
    };
  }, [onAuthStateChange]);

  // Handle navigation based on auth and onboarding state
  useEffect(() => {
    // Skip navigation during loading states
    if (authLoading || isOnboarded === null) {
      console.log('[OnboardingDebug] Skipping navigation - Loading:', {
        authLoading,
        isOnboarded,
        segments
      });
      return;
    }
    
    const inOnboardingGroup = segments[0] === 'onboarding';
        
    // Authenticated users should be considered onboarded
    if (isAuthenticated && !isOnboarded) {
      handleSetIsOnboarded(true);
      return; // Wait for state update before navigation
    }
    
    // Navigate to proper screen
    if (isAuthenticated) {
      // Authenticated users always go to main app
      if (inOnboardingGroup) {
        router.replace('/');
      }
    } else {
      // Non-authenticated users need onboarding
      if (!isOnboarded && !inOnboardingGroup) {
        router.replace('/onboarding');
      } else if (isOnboarded && !inOnboardingGroup) {
        router.replace('/onboarding/login');
      } else if (isOnboarded && inOnboardingGroup) {
        // They've completed onboarding before but aren't logged in 
        // Let them stay in onboarding for login/register screens
      }
    }
  }, [isOnboarded, isAuthenticated, segments, authLoading, router, handleSetIsOnboarded]);

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarded: isOnboarded ?? false,
        setIsOnboarded: handleSetIsOnboarded,
      }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 