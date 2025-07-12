import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import Purchases, { CustomerInfo, PurchasesEntitlementInfo } from 'react-native-purchases'

const PREMIUM_ENTITLEMENT_ID = 'pro'

type RevenueCatContextType = {
  customerInfo: CustomerInfo | null
  isProMember: boolean
  loading: boolean
  refreshCustomerInfo: () => Promise<void>
  loginUser: (userId: string) => Promise<void>
  logoutUser: () => Promise<void>
}

const RevenueCatContext = createContext<RevenueCatContextType>({
  customerInfo: null,
  isProMember: false,
  loading: true,
  refreshCustomerInfo: async () => {},
  loginUser: async () => {},
  logoutUser: async () => {},
})

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [isProMember, setIsProMember] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  // Check if user has premium entitlement
  const checkPremiumStatus = (info: CustomerInfo): boolean => {
    const proEntitlement: PurchasesEntitlementInfo | undefined = 
      info.entitlements.active[PREMIUM_ENTITLEMENT_ID]
    return !!proEntitlement
  }

  // Listener for customer info updates from RevenueCat
  useEffect(() => {
    const customerInfoUpdateHandler = (info: CustomerInfo) => {
      console.log('[RevenueCat] Customer info updated')
      const isPremium = checkPremiumStatus(info)
      setIsProMember(isPremium)
      setCustomerInfo(info)
    }

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateHandler)
    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateHandler)
    }
  }, [])

  // Initialize RevenueCat and get initial customer info
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        console.log('[RevenueCat] Checking if configured...')
        if (await Purchases.isConfigured()) {
          console.log('[RevenueCat] Already configured, getting customer info...')
          await refreshCustomerInfo()
        } else {
          console.log('[RevenueCat] Not configured yet')
        }
      } catch (error) {
        console.error('[RevenueCat] Error during initialization:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeRevenueCat()
  }, [])

  const refreshCustomerInfo = async () => {
    try {
      console.log('[RevenueCat] Refreshing customer info...')
      if (!(await Purchases.isConfigured())) {
        console.log('[RevenueCat] SDK not configured, skipping refresh')
        return
      }

      const fetchedCustomerInfo = await Purchases.getCustomerInfo()
      const isPremium = checkPremiumStatus(fetchedCustomerInfo)
      
      console.log('[RevenueCat] Customer info refreshed, isPremium:', isPremium)
      setIsProMember(isPremium)
      setCustomerInfo(fetchedCustomerInfo)
    } catch (error) {
      console.error('[RevenueCat] Error refreshing customer info:', error)
    }
  }

  const loginUser = async (userId: string) => {
    try {
      console.log('[RevenueCat] Logging in user:', userId)
      if (!(await Purchases.isConfigured())) {
        console.warn('[RevenueCat] SDK not configured, skipping login')
        return
      }

      const loginResult = await Purchases.logIn(userId)
      const isPremium = checkPremiumStatus(loginResult.customerInfo)
      
      console.log('[RevenueCat] User logged in successfully, isPremium:', isPremium)
      setCustomerInfo(loginResult.customerInfo)
      setIsProMember(isPremium)
    } catch (error) {
      console.error('[RevenueCat] Error logging in user:', error)
    }
  }

  const logoutUser = async () => {
    try {
      console.log('[RevenueCat] Logging out user...')
      if (!(await Purchases.isConfigured())) {
        console.warn('[RevenueCat] SDK not configured, skipping logout')
        return
      }

      await Purchases.logOut()
      console.log('[RevenueCat] User logged out successfully')
      setCustomerInfo(null)
      setIsProMember(false)
    } catch (error) {
      console.error('[RevenueCat] Error logging out user:', error)
    }
  }

  return (
    <RevenueCatContext.Provider
      value={{
        customerInfo,
        isProMember,
        loading,
        refreshCustomerInfo,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  )
}

export function useRevenueCat() {
  return useContext(RevenueCatContext)
} 