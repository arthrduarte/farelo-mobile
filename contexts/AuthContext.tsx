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
import Purchases, { CustomerInfo, PurchasesEntitlementInfo } from 'react-native-purchases';

export const profileUpdateEmitter = new EventEmitter();
export const PROFILE_UPDATED = 'PROFILE_UPDATED';

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

  useEffect(() => {
    // Listener for customer info updates from RevenueCat
    const customerInfoUpdateHandler = (info: CustomerInfo) => {      
      const proEntitlement: PurchasesEntitlementInfo | undefined = info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      
      setIsProMember(!!proEntitlement);
      setCustomerInfo(info); // Set customer info after logging
    };
    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateHandler);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateHandler);
    };
  }, []);

  const refreshCustomerInfo = async () => {
    if (!user) {
      return;
    }
    try {
      const fetchedCustomerInfo = await Purchases.getCustomerInfo();
      const proEntitlement: PurchasesEntitlementInfo | undefined = fetchedCustomerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      
      setIsProMember(!!proEntitlement);
      setCustomerInfo(fetchedCustomerInfo); 
    } catch (error) {
      console.error('[AuthContext] Error refreshing CustomerInfo:', error);
    }
  };

  // 1) on mount: grab current session & customer info
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('[1] Starting getSession');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('[2] getSession completed');
        const { session } = data;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('[3] User exists, calling fetchProfile');
          await fetchProfile(session.user.id);
          console.log('[4] fetchProfile completed');
          
          if (await Purchases.isConfigured()) {
            await refreshCustomerInfo();
          }
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected error during session initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  // 2) subscribe to any auth state change (signIn, signOut, token refresh)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log('[6] onAuthStateChange fired');
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
        }
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
      
      if (await Purchases.isConfigured()) {
        Purchases.logOut()
            .catch(rcError => console.error('[AuthContext] RevenueCat logout error:', rcError));
      }

      setLoading(false)
      setProfile(null)
      setCustomerInfo(null)
      setIsProMember(false)
    } catch (err) {
      console.error("[AuthContext] Unexpected error during signOut:", err)
      setLoading(false)
      throw err
    }
  }

  const fetchProfile = async (userId: string) => {
    console.log('[7] fetchProfile started');
    try {
      console.log('[8] Querying supabase');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      console.log('[9] Supabase query done');

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error)
      } else {
        setProfile(data)
        // Log user into RevenueCat once profile is fetched & refresh customer info
        if (data && data.id) {
          console.log('[10] Checking Purchases.isConfigured');
          if (await Purchases.isConfigured()) {
            console.log('[11] Logging into RevenueCat');
            Purchases.logIn(data.id)
                .then(async (loginResult) => {
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
      console.log('[12] About to set loading false');
      setLoading(true) 
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

