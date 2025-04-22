import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  Session,
  User,
  AuthChangeEvent,
  SupabaseClient,
} from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile } from '../types/db'

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  // 1) on mount: grab current session (Auto–rehydrated by Supabase/AsyncStorage)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })
  }, [])

  // 2) subscribe to any auth state change (signIn, signOut, token refresh)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) fetchProfile(session.user.id)
        else setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // 3) helpers
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setLoading(false)
  }
  
  const signOut = async () => {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setLoading(false)
    }

    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    }
    
  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

