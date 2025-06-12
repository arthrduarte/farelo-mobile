// screens/register.tsx

import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { RegisterWithEmail } from '@/components/auth/RegisterWithEmail'

const { width } = Dimensions.get('window')

export default function RegisterScreen() {
  const router = useRouter()
  const [showEmailForm, setShowEmailForm] = useState(false)

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.form}>
          <ThemedText type="title" style={styles.heading}>
            Create Account
          </ThemedText>

          <GoogleButton />
          
          {showEmailForm ? (
            <RegisterWithEmail />
          ) : (
            <>
              <TouchableOpacity
                style={styles.emailButton}
                onPress={() => setShowEmailForm(true)}
              >
                <ThemedText style={styles.emailButtonText}>
                  Or continue with email
                </ThemedText>
              </TouchableOpacity>
            </>
          )}

          {showEmailForm && (
            <TouchableOpacity
              onPress={() => router.push('/onboarding/login')}
              style={styles.loginLink}
            >
              <ThemedText style={styles.loginText}>
                Already have an account? Sign in
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ede4d2',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 32,
    color: '#793206',
    textAlign: 'center',
    marginBottom: 24,
  },
  emailButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#793206',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#793206',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    color: '#793206',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})
