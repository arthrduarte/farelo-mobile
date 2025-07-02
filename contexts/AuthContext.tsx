import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from 'react'
import {
  Session,
  User,
  AuthChangeEvent,
  SupabaseClient,
} from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile } from '../types/db'
import EventEmitter from 'eventemitter3'; // Using eventemitter3
import { useRevenueCat } from './RevenueCatContext';

export const profileUpdateEmitter = new EventEmitter();
export const PROFILE_UPDATED = 'PROFILE_UPDATED';

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  
  // Get RevenueCat context
  const revenueCat = useRevenueCat();

  // 1) on mount: grab current session & customer info
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('[1] Starting getSession - Timestamp:', new Date().toISOString());
        console.log('[1.1] Network state check - navigator.onLine:', typeof navigator !== 'undefined' ? navigator.onLine : 'N/A');
        console.log('[1.2] Checking local storage state...');
        
        // Check AsyncStorage/SecureStore state (React Native specific)
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            console.log('[1.2.1] Web localStorage available');
          } else {
            console.log('[1.2.1] Using React Native AsyncStorage/SecureStore');
          }
        } catch (storageErr) {
          console.log('[1.2.1] Storage check error:', storageErr instanceof Error ? storageErr.message : String(storageErr));
        }
        
        console.log('[1.3] Starting getSession call...');
        
        // Add timeout wrapper to detect hanging
        const getSessionWithTimeout = Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getSession timeout after 10 seconds')), 10000)
          )
        ]);
        
        const { data, error } = await getSessionWithTimeout as any;
        
        console.log('[2] getSession completed - Timestamp:', new Date().toISOString());
        console.log('[2.1] getSession data:', data ? 'Present' : 'Null');
        console.log('[2.2] getSession error:', error ? error.message : 'None');
        console.log('[2.3] Session object:', data?.session ? 'Present' : 'Null');
        console.log('[2.4] User object:', data?.session?.user ? 'Present' : 'Null');
        console.log('[2.5] Access token present:', data?.session?.access_token ? 'Yes' : 'No');
        console.log('[2.6] Refresh token present:', data?.session?.refresh_token ? 'Yes' : 'No');
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          console.log('[2.7] Error details - name:', error.name);
          console.log('[2.8] Error details - message:', error.message);
          console.log('[2.9] Error details - stack:', error.stack);
          setLoading(false);
          return;
        }

        console.log('[2.10] Setting session state...');
        const { session } = data;
        setSession(session);
        setUser(session?.user ?? null);
        console.log('[2.11] Session state set complete');

        if (session?.user) {
          console.log('[3] User exists, calling fetchProfile - User ID:', session.user.id);
          await fetchProfile(session.user.id);
          console.log('[4] fetchProfile completed');
        } else {
          console.log('[3] No user session found');
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected error during session initialization:', err);
        console.log('[ERROR] Error type:', typeof err);
        console.log('[ERROR] Error name:', err instanceof Error ? err.name : 'Unknown');
        console.log('[ERROR] Error message:', err instanceof Error ? err.message : String(err));
        console.log('[ERROR] Error stack:', err instanceof Error ? err.stack : 'No stack');
        
        if (err instanceof Error && err.message.includes('timeout')) {
          console.error('[CRITICAL] getSession timed out - this is the hanging bug!');
        }
      } finally {
        console.log('[5] Setting loading to false - Timestamp:', new Date().toISOString());
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  // 2) subscribe to any auth state change (signIn, signOut, token refresh)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log('[6] onAuthStateChange fired - Event:', event, '- Timestamp:', new Date().toISOString());
        console.log('[6.1] Auth event type:', event);
        console.log('[6.2] Session present:', session ? 'Yes' : 'No');
        console.log('[6.3] User present:', session?.user ? 'Yes' : 'No');
        console.log('[6.4] Access token present:', session?.access_token ? 'Yes' : 'No');
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
            console.log('[6.5] User found, calling fetchProfile from auth state change');
            await fetchProfile(session.user.id);
            console.log('[6.6] fetchProfile completed from auth state change');
        } else {
          console.log('[6.5] No user, clearing profile');
          setProfile(null)
        }
        console.log('[6.9] onAuthStateChange processing complete');
    })

    return () => listener.subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 3) helpers
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }
  
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("[AuthContext] Error during signOut:", error)
        throw error
      }
      
      // Logout from RevenueCat
      await revenueCat.logoutUser()

      setLoading(false)
      setProfile(null)
    } catch (err) {
      console.error("[AuthContext] Unexpected error during signOut:", err)
      setLoading(false)
      throw err
    }
  }

  const fetchProfile = async (userId: string) => {
    console.log('[7] fetchProfile started - User ID:', userId, '- Timestamp:', new Date().toISOString());
    try {
      console.log('[8] Querying supabase for profile...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      console.log('[9] Supabase profile query done - Success:', !error, '- Profile ID:', data?.id || 'None');

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error)
      } else {
        setProfile(data)
        // Log user into RevenueCat once profile is fetched
        if (data && data.id) {
          console.log('[10] Logging user into RevenueCat');
          await revenueCat.loginUser(data.id)
        }
      }
      console.log('[12] About to set loading false');
      setLoading(false) 
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err)
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[AuthContext] Error refreshing profile:', error);
      } else {
        setProfile(data);
        // Emit event to notify all listeners that profile was updated
        profileUpdateEmitter.emit(PROFILE_UPDATED, data);
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error refreshing profile:', err);
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

