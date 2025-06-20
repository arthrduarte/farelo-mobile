import React from 'react'
import { Alert, TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { supabase } from '@/lib/supabase'
import { usePaywall } from '@/contexts/PaywallContext'

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  webClientId: '791951088468-breaeqj6q9ghgjqulnnb2mvkurm0rmei.apps.googleusercontent.com',
  iosClientId: '791951088468-jql23hqupnu5eudogm3rrc8h634f6c8h.apps.googleusercontent.com',
})

export const GoogleButton = () => {
  const router = useRouter()
  const { showPaywall } = usePaywall()

  async function signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      
      if (!userInfo) throw new Error('Google didn\'t return user info')

      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google', 
          token: userInfo.data.idToken,
        })
        
        if (error) {
          Alert.alert('Authentication Error', error.message)
          return
        }

        showPaywall()
        router.replace('/')
      } else {
        throw new Error('no ID token present!')
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available')
      } else {
        console.log('Other error:', error.message)
        Alert.alert('Error', error.message || 'An error occurred during sign in')
      }
    }
  }

  return (
    <TouchableOpacity style={styles.button} onPress={signInWithGoogle} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <View style={styles.googleIcon}>
          <View style={styles.googleLogo}>
            <Image source={require('@/assets/images/google_logo.png')} style={styles.googleIcon} />
          </View>
        </View>
      </View>
      <Text style={styles.buttonText}>Continue with Google</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DADCE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginRight: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
}) 