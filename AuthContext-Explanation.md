# AuthContext.tsx - Complete Guide

## Overview
The `AuthContext` is the central authentication system for the Farelo mobile app. It manages user authentication through Supabase, user profile data, and premium subscription status through RevenueCat. Think of it as the "single source of truth" for everything related to who the user is and what they can access.

## What Does AuthContext Manage?

### State Variables
```typescript
const [session, setSession] = useState<Session | null>(null)     // Supabase session object
const [user, setUser] = useState<User | null>(null)             // Supabase user object  
const [profile, setProfile] = useState<Profile | null>(null)    // Custom profile from our database
const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null) // RevenueCat subscription info
const [isProMember, setIsProMember] = useState<boolean>(false)  // Whether user has premium access
const [loading, setLoading] = useState(true)                    // Loading state for UI
```

### Key Functions Provided
- `signIn(email, password)` - Authenticate user with email/password
- `signOut()` - Log out user and clean up all state
- `refreshProfile()` - Reload user profile from database
- `refreshCustomerInfo()` - Reload subscription status from RevenueCat

## How Authentication Flow Works

### 1. App Startup (Initial Load)
```typescript
useEffect(() => {
  const initializeSession = async () => {
    // [1] Get current session from Supabase (if user was already logged in)
    const { data, error } = await supabase.auth.getSession();
    
    // [2] If session exists, set user state
    setSession(session);
    setUser(session?.user ?? null);
    
    // [3] If user exists, fetch their profile and subscription info
    if (session?.user) {
      await fetchProfile(session.user.id);        // Get profile from database
      await refreshCustomerInfo();                // Get RevenueCat subscription status
    }
    
    setLoading(false); // Done loading
  };
  initializeSession();
}, []);
```

### 2. Auth State Changes (Login/Logout Events)
```typescript
useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // This fires whenever auth state changes (login, logout, token refresh, etc.)
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // User just logged in - fetch their data
        await fetchProfile(session.user.id);
        await refreshCustomerInfo();
      } else {
        // User logged out - clear all data
        setProfile(null)
        setCustomerInfo(null)
        setIsProMember(false)
      }
    }
  )
  return () => listener.subscription.unsubscribe()
}, [])
```

## Profile Management

### fetchProfile Function
```typescript
const fetchProfile = async (userId: string) => {
  // Get user profile from our custom 'profiles' table
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!error) {
    setProfile(data)
    
    // Log user into RevenueCat using profile ID
    if (data?.id && await Purchases.isConfigured()) {
      const loginResult = await Purchases.logIn(data.id)
      setCustomerInfo(loginResult.customerInfo)
      
      // Check if user has premium subscription
      const proEntitlement = loginResult.customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]
      setIsProMember(!!proEntitlement)
    }
  }
}
```

## RevenueCat Integration (Premium Subscriptions)

### Premium Status Detection
The app checks if a user has premium access by looking for the "pro" entitlement in RevenueCat:

```typescript
const PREMIUM_ENTITLEMENT_ID = 'pro';

// Check if user has active premium subscription
const proEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
setIsProMember(!!proEntitlement); // Convert to boolean
```

### Customer Info Updates
RevenueCat automatically notifies us when subscription status changes:

```typescript
useEffect(() => {
  const customerInfoUpdateHandler = (info: CustomerInfo) => {
    const proEntitlement = info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    setIsProMember(!!proEntitlement);
    setCustomerInfo(info);
  };
  
  Purchases.addCustomerInfoUpdateListener(customerInfoUpdateHandler);
  return () => Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateHandler);
}, []);
```

## Profile Update Broadcasting

The context uses an EventEmitter to notify other parts of the app when profile data changes:

```typescript
import EventEmitter from 'eventemitter3';

export const profileUpdateEmitter = new EventEmitter();
export const PROFILE_UPDATED = 'PROFILE_UPDATED';

// In refreshProfile function:
profileUpdateEmitter.emit(PROFILE_UPDATED, data);
```

Other components can listen for these updates:
```typescript
// In other components:
useEffect(() => {
  const handleProfileUpdate = (updatedProfile) => {
    // Handle profile update
  };
  
  profileUpdateEmitter.on(PROFILE_UPDATED, handleProfileUpdate);
  return () => profileUpdateEmitter.off(PROFILE_UPDATED, handleProfileUpdate);
}, []);
```

## How to Use AuthContext in Components

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, profile, isProMember, loading, signIn, signOut } = useAuth();
  
  if (loading) {
    return <Text>Loading...</Text>;
  }
  
  if (!user) {
    return <LoginScreen onLogin={signIn} />;
  }
  
  return (
    <View>
      <Text>Hello {profile?.display_name}!</Text>
      {isProMember && <Text>You have premium access!</Text>}
      <Button title="Logout" onPress={signOut} />
    </View>
  );
}
```

## Current Issues and Problems

### 1. **Critical Bug - Loading State**
**Line 187**: `setLoading(true)` should be `setLoading(false)`
```typescript
// BUG: This keeps loading state stuck at true
setLoading(true) 

// SHOULD BE:
setLoading(false)
```

### 2. **Duplicate Function Calls**
The `fetchProfile` function gets called twice during app startup:
- Once from the initial `getSession()` call
- Again from the `onAuthStateChange` listener

**Evidence from logs:**
```
LOG  [1] Starting getSession
LOG  [3] User exists, calling fetchProfile
LOG  [7] fetchProfile started
LOG  [6] onAuthStateChange fired          // ← This fires even during initial load
LOG  [7] fetchProfile started            // ← fetchProfile called again
```

### 3. **Race Conditions**
Because `fetchProfile` runs twice simultaneously, there could be race conditions where:
- RevenueCat login happens twice
- Profile state gets set multiple times
- CustomerInfo gets fetched/set multiple times

### 4. **Unnecessary Auth State Change Triggers**
The `onAuthStateChange` listener fires even during the initial session load, causing redundant work.

## Recommended Refactoring Strategy

1. **Fix the loading bug** first
2. **Prevent duplicate fetchProfile calls** by adding a flag or redesigning the initialization flow
3. **Simplify the auth state flow** to be more predictable
4. **Add better error handling** throughout
5. **Consider extracting RevenueCat logic** into a separate hook or context

The main goal should be to have a single, predictable flow for authentication that doesn't duplicate work or create race conditions. 