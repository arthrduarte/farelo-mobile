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
// import { EventEmitter } from 'events'; // Replaced Node.js events
import EventEmitter from 'eventemitter3'; // Using eventemitter3
import Purchases, { CustomerInfo, PurchasesEntitlementInfo } from 'react-native-purchases';

// Global event emitter for profile updates
export const profileUpdateEmitter = new EventEmitter();
// profileUpdateEmitter.setMaxListeners(25); // setMaxListeners is not typically used with eventemitter3
export const PROFILE_UPDATED = 'PROFILE_UPDATED';

// Define your primary entitlement ID from RevenueCat
const PREMIUM_ENTITLEMENT_ID = 'pro';

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  customerInfo: CustomerInfo | null;
  isProMember: boolean;
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  onAuthStateChange: (callback: (isAuthenticated: boolean) => void) => () => void
  refreshProfile: () => Promise<void>
  refreshCustomerInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  customerInfo: null,
  isProMember: false,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  onAuthStateChange: () => () => {},
  refreshProfile: async () => {},
  refreshCustomerInfo: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isProMember, setIsProMember] = useState<boolean>(false);
  const callbacksRef = useRef<((isAuthenticated: boolean) => void)[]>([])

  // Register callback for auth state changes - return cleanup function
  const onAuthStateChange = useCallback((callback: (isAuthenticated: boolean) => void) => {
    callbacksRef.current.push(callback)
    
    // Initial callback with current state if not loading
    if (!loading) {
      callback(!!session && !!profile)
    }
    
    // Return cleanup function to remove this callback
    return () => {
      callbacksRef.current = callbacksRef.current.filter(cb => cb !== callback)
    }
  }, [session, profile, loading /*isProMember*/])
  
  // Function to notify all registered callbacks
  const notifyCallbacks = useCallback((isAuthenticated: boolean) => {
    callbacksRef.current.forEach(callback => callback(isAuthenticated))
  }, [])

  useEffect(() => {
    // Listener for customer info updates from RevenueCat
    const customerInfoUpdateHandler = (info: CustomerInfo) => {
      console.log('[AuthContext] Received CustomerInfo update:', info);
      setCustomerInfo(info);
      const proEntitlement: PurchasesEntitlementInfo | undefined = info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      setIsProMember(!!proEntitlement);
      // Optionally, if your profile.has_access relies on this, you might trigger a profile sync here
      // or rely on webhooks as primary mechanism for DB updates.
    };
    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateHandler);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateHandler);
    };
  }, []);

  const refreshCustomerInfo = async () => {
    if (!user) return;
    try {
      console.log('[AuthContext] Refreshing CustomerInfo...');
      const fetchedCustomerInfo = await Purchases.getCustomerInfo();
      setCustomerInfo(fetchedCustomerInfo);
      const proEntitlement: PurchasesEntitlementInfo | undefined = fetchedCustomerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      setIsProMember(!!proEntitlement);
      console.log('[AuthContext] CustomerInfo refreshed:', fetchedCustomerInfo, "Is Pro:", !!proEntitlement);
    } catch (error) {
      console.error('[AuthContext] Error refreshing CustomerInfo:', error);
    }
  };

  // 1) on mount: grab current session & customer info
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
        // Initial fetch of customer info after user is identified
        // logIn in fetchProfile will also attempt to get customerInfo, this is a fallback/explicit refresh
        if (await Purchases.isConfigured()) {
            await refreshCustomerInfo();
        }
      } else {
        notifyCallbacks(false)
        setLoading(false)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyCallbacks])

  // Notify callbacks when profile or pro status changes
  useEffect(() => {
    if (!loading) {
      const isAuthenticated = !!session && !!profile;
      notifyCallbacks(isAuthenticated)
    }
  }, [session, profile, loading, notifyCallbacks, isProMember])

  // 2) subscribe to any auth state change (signIn, signOut, token refresh)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
            await fetchProfile(session.user.id);
            // Refresh customer info on auth changes too
            if (await Purchases.isConfigured()) {
                await refreshCustomerInfo();
            }
        } else {
          setProfile(null)
          setCustomerInfo(null)
          setIsProMember(false)
          notifyCallbacks(false)
        }
    })

    return () => listener.subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyCallbacks])

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
      
      if (await Purchases.isConfigured()) {
        Purchases.logOut()
            .then(() => console.log('[AuthContext] RevenueCat user logged out'))
            .catch(rcError => console.error('[AuthContext] RevenueCat logout error:', rcError));
      }

      setLoading(false)
      setProfile(null)
      setCustomerInfo(null)
      setIsProMember(false)
      
      notifyCallbacks(false)
    } catch (err) {
      console.error("[AuthContext] Unexpected error during signOut:", err)
      setLoading(false)
      throw err
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error)
      } else {
        setProfile(data)
        // Log user into RevenueCat once profile is fetched & refresh customer info
        if (data && data.id) {
          if (await Purchases.isConfigured()) {
            Purchases.logIn(data.id)
                .then(async (loginResult) => {
                    console.log('[AuthContext] RevenueCat user logged in:', data.id, loginResult);
                    setCustomerInfo(loginResult.customerInfo);
                    const proEntitlement: PurchasesEntitlementInfo | undefined = loginResult.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
                    setIsProMember(!!proEntitlement);
                })
                .catch(rcError => console.error('[AuthContext] RevenueCat login error:', rcError));
          } else {
             console.warn('[AuthContext] Purchases SDK not configured, skipping logIn and customerInfo fetch.');
          }
        }
      }
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
        // After profile refresh, also refresh customer info from RevenueCat
        if (await Purchases.isConfigured()) {
          await refreshCustomerInfo();
        }
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
        customerInfo,
        isProMember,
        loading,
        signIn,
        signOut,
        onAuthStateChange,
        refreshProfile,
        refreshCustomerInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

