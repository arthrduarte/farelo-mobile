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
    console.log('[1] AuthContext: Initial useEffect mounting');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[2] AuthContext: getSession.then callback started');
      // setSession(session)
      // setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('[3] AuthContext: User session exists, calling fetchProfile');
        await fetchProfile(session.user.id)
        console.log('[4] AuthContext: fetchProfile completed');
        if (await Purchases.isConfigured()) {
            console.log('[5] AuthContext: Purchases configured, calling refreshCustomerInfo');
            await refreshCustomerInfo();
            console.log('[6] AuthContext: refreshCustomerInfo completed');
        }
      } else {
        console.log('[7] AuthContext: No user session');
        // setLoading(false)
      }
      console.log('[8] AuthContext: getSession.then callback finished');
    }).catch(error => {
        console.error('[9] AuthContext: getSession promise rejected:', error);
        setLoading(false);
    });
  }, [])

  // 2) subscribe to any auth state change (signIn, signOut, token refresh)
  useEffect(() => {
    console.log('[10] AuthContext: onAuthStateChange useEffect mounting');
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log(`[11] AuthContext: onAuthStateChange event=${event}`);
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
            console.log('[12] AuthContext: onAuthStateChange user exists, calling fetchProfile');
            await fetchProfile(session.user.id);
            console.log('[13] AuthContext: onAuthStateChange fetchProfile completed');
            // Refresh customer info on auth changes too
            if (await Purchases.isConfigured()) {
                console.log('[14] AuthContext: onAuthStateChange Purchases configured, calling refreshCustomerInfo');
                await refreshCustomerInfo();
                console.log('[15] AuthContext: onAuthStateChange refreshCustomerInfo completed');
            }
        } else {
          console.log('[16] AuthContext: onAuthStateChange no user, clearing state');
          setProfile(null)
          setCustomerInfo(null)
          setIsProMember(false)
        }
    })

    return () => {
        console.log('[17] AuthContext: onAuthStateChange listener unsubscribing');
        listener.subscription.unsubscribe()
    }
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
    console.log(`[18] AuthContext: fetchProfile started for userId=${userId}`);
    try {
      console.log('[19] AuthContext: Making supabase query for profile');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      console.log('[20] AuthContext: Supabase query completed');

      if (error) {
        console.error('[21] AuthContext: Error fetching profile:', error)
      } else {
        console.log('[22] AuthContext: Setting profile data');
        setProfile(data)
        // Log user into RevenueCat once profile is fetched & refresh customer info
        if (data && data.id) {
          console.log('[23] AuthContext: Profile has ID, checking Purchases configuration');
          if (await Purchases.isConfigured()) {
            console.log('[24] AuthContext: Purchases configured, logging in to RevenueCat');
            Purchases.logIn(data.id)
                .then(async (loginResult) => {
                    console.log('[25] AuthContext: RevenueCat login successful');
                    setCustomerInfo(loginResult.customerInfo);
                    const proEntitlement: PurchasesEntitlementInfo | undefined = loginResult.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
                    
                    setIsProMember(!!proEntitlement);
                    console.log('[26] AuthContext: Customer info and pro status updated');
                })
                .catch(rcError => {
                    console.error('[27] AuthContext: RevenueCat login error:', rcError);
                });
          } else {
             console.warn('[28] AuthContext: Purchases SDK not configured, skipping logIn');
          }
        }
      }
      console.log('[29] AuthContext: About to set loading to false');
      // setLoading(true)
    } catch (err) {
      console.error('[30] AuthContext: Unexpected error fetching profile:', err)
      console.log('[31] AuthContext: Setting loading to false in catch block');
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user?.id) return;
    console.log('[32] AuthContext: refreshProfile started');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[33] AuthContext: Error refreshing profile:', error);
      } else {
        console.log('[34] AuthContext: Profile refreshed successfully');
        setProfile(data);
        // Emit event to notify all listeners that profile was updated
        profileUpdateEmitter.emit(PROFILE_UPDATED, data);
        // After profile refresh, also refresh customer info from RevenueCat
        if (await Purchases.isConfigured()) {
          console.log('[35] AuthContext: Refreshing customer info after profile refresh');
          await refreshCustomerInfo();
        }
      }
    } catch (err) {
      console.error('[36] AuthContext: Unexpected error refreshing profile:', err);
    } finally {
      console.log('[37] AuthContext: refreshProfile setting loading to false');
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

