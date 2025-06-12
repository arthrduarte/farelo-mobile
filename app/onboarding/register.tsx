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
          <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
          <ThemedText type="title" style={styles.heading}>
            Create Account
          </ThemedText>

          {showEmailForm ? (
            <RegisterWithEmail />
          ) : (
            <>
              <GoogleButton />
              <TouchableOpacity
                style={styles.emailButton}
                onPress={() => setShowEmailForm(true)}
              >
                <ThemedText style={styles.emailButtonText}>
                  Register with email
                </ThemedText>
              </TouchableOpacity>
            </>
          )}

          {showEmailForm && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowEmailForm(false)}
            >
              <ThemedText style={styles.backButtonText}>
                Back to sign in options
              </ThemedText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.push('/onboarding/login')}
            style={styles.loginLink}
          >
            <ThemedText style={styles.loginText}>
              Already have an account? Log in
            </ThemedText>
          </TouchableOpacity>
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
  logo: {
    width: 100,
    height: 20,
    resizeMode: 'contain',
    padding: 24,
    alignSelf: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 32,
    color: '#793206',
    textAlign: 'center',
    marginBottom: 40,
  },
  emailButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#793206',
    fontSize: 16,
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
