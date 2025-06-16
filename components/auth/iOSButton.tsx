import React from 'react'
import { Alert, View, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import * as AppleAuthentication from 'expo-apple-authentication'
import { supabase } from '@/lib/supabase'

interface IOSButtonProps {
  redirectTo?: any
}

export const IOSButton = ({ redirectTo = '/paywall' }: IOSButtonProps) => {
  const router = useRouter()

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })

      if (!credential.identityToken) {
        throw new Error('Apple didn\'t return identity token')
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      })

      if (error) {
        console.log('Apple Sign-in error:', error)
        Alert.alert('Authentication Error', error.message)
        return
      }

      router.replace(redirectTo)
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the Apple Sign-In flow
        return
      } else {
        console.log('Apple Sign-in error:', error.message)
        Alert.alert('Error', error.message || 'An error occurred during Apple Sign-In')
      }
    }
  }

  // Only render on iOS and if Apple Authentication is available
  if (Platform.OS !== 'ios') {
    return null
  }

  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={8}
        style={styles.button}
        onPress={signInWithApple}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    width: '100%',
    height: 50,
  },
}) 