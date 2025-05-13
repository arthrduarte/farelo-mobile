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
import { EventEmitter } from 'events';

// Global event emitter for profile updates
export const profileUpdateEmitter = new EventEmitter();
profileUpdateEmitter.setMaxListeners(25);
export const PROFILE_UPDATED = 'PROFILE_UPDATED';

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  onAuthStateChange: (callback: (isAuthenticated: boolean) => void) => () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  onAuthStateChange: () => () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
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
  }, [session, profile, loading])
  
  // Function to notify all registered callbacks
  const notifyCallbacks = useCallback((isAuthenticated: boolean) => {
    callbacksRef.current.forEach(callback => callback(isAuthenticated))
  }, [])

  // 1) on mount: grab current session (Auto–rehydrated by Supabase/AsyncStorage)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        notifyCallbacks(false)
        setLoading(false)
      }
    })
  }, [notifyCallbacks])

  // Notify callbacks when profile is set
  useEffect(() => {
    if (!loading) {
      const isAuthenticated = !!session && !!profile
      notifyCallbacks(isAuthenticated)
    }
  }, [session, profile, loading, notifyCallbacks])

  // 2) subscribe to any auth state change (signIn, signOut, token refresh)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) fetchProfile(session.user.id)
        else {
          setProfile(null)
          // Notify callbacks immediately for logout
          notifyCallbacks(false)
        }
    })

    return () => listener.subscription.unsubscribe()
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
      
      setLoading(false)
      setProfile(null)
      
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
      }
      setLoading(false)
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err)
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user?.id) return;
    
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
        onAuthStateChange,
        refreshProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

