import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from './AuthContext';

type OnboardingContextType = {
  hasCompletedOnboardingFlow: boolean;
  setHasCompletedOnboardingFlow: (value: boolean) => void;
  isOnboardingLoading: boolean; // Expose loading state
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'hasCompletedInitialOnboardingFlow';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // null: initial state before AsyncStorage is checked
  // true: user has completed the flow
  // false: user has not completed the flow
  const [hasCompletedOnboardingFlow, setHasCompletedOnboardingFlowState] = useState<boolean | null>(null);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(true); // Loading state for AsyncStorage check

  const segments = useSegments();
  const pathname = usePathname(); // Get current pathname
  const router = useRouter();
  const { user, loading: authLoading, session } = useAuth(); // Get user and session

  // Function to update onboarding status in AsyncStorage and state
  const setHasCompletedOnboardingFlow = useCallback(async (value: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(value));
      setHasCompletedOnboardingFlowState(value);
    } catch (error) {
      console.error('[OnboardingContext] Error setting onboarding flow status:', error);
    }
  }, []);

  // Check onboarding status from storage on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setIsOnboardingLoading(true);
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        setHasCompletedOnboardingFlowState(value === 'true');
      } catch (error) {
        console.error('[OnboardingContext] Error checking onboarding status from AsyncStorage:', error);
        setHasCompletedOnboardingFlowState(false); // Default to not completed on error
      } finally {
        setIsOnboardingLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Handle navigation based on auth and onboarding state
  useEffect(() => {
    // Wait for both auth and onboarding status to be loaded
    if (authLoading || isOnboardingLoading) {
      return;
    }

    const inOnboardingGroup = segments[0] === 'onboarding';
    const isExactlyOnboardingRoot = pathname === '/onboarding';

    // Scenario 1: User has NOT completed the onboarding flow
    if (hasCompletedOnboardingFlow === false) {
      if (!inOnboardingGroup) {
        router.replace('/onboarding');
      }
      // User stays within /onboarding/* routes until flow is completed.
      // If they are at /onboarding/login or /onboarding/register, they should stay there.
      // If they somehow land on /onboarding root and have not completed, they stay.
      return;
    }

    // Scenario 2: User HAS completed the onboarding flow
    if (hasCompletedOnboardingFlow === true) {
      if (!user) { // Not authenticated
        // If user is in a non-onboarding path OR on the root of onboarding (e.g. carousel), redirect to login.
        // Allow them to be on /onboarding/register.
        if (!inOnboardingGroup || isExactlyOnboardingRoot) {
           if (pathname !== '/onboarding/login' && pathname !== '/onboarding/register') {
            router.replace('/onboarding/login');
           }
        }
      } else { // Authenticated
        if (inOnboardingGroup) {
          router.replace('/');
        }
      }
    }
  }, [hasCompletedOnboardingFlow, user, session, authLoading, isOnboardingLoading, segments, router, pathname]);

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboardingFlow: hasCompletedOnboardingFlow ?? false, // Default to false if null
        setHasCompletedOnboardingFlow,
        isOnboardingLoading,
      }}
    >
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