// screens/register.tsx

import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Linking,
  ScrollView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { RegisterWithEmail } from '@/components/auth/RegisterWithEmail'
import { AntDesign } from '@expo/vector-icons'
import { IOSButton } from '@/components/auth/iOSButton'

const { width } = Dimensions.get('window')

export default function RegisterScreen() {
  const router = useRouter()
  const [showEmailForm, setShowEmailForm] = useState(false)

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <AntDesign name="arrowleft" size={24} color="#793206" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          style={styles.scrollContent}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          enabled={true}
        >
          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedText type="title" style={styles.heading}>
              Create an account
            </ThemedText>

            <View style={styles.buttonContainer}>
              <GoogleButton />

              <IOSButton />
            </View>
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <ThemedText style={styles.orText}>or</ThemedText>
              <View style={styles.divider} />
            </View>

            {showEmailForm ? (
              <RegisterWithEmail />
            ) : (
              <TouchableOpacity
                style={styles.emailButton}
                onPress={() => setShowEmailForm(true)}
              >
                <ThemedText style={styles.emailButtonText}>
                  Continue with email
                </ThemedText>
              </TouchableOpacity>
            )}

            <View style={styles.termsContainer}>
              <ThemedText style={styles.termsText}>
                By continuing you are agreeing to our{' '}
                <ThemedText 
                  style={styles.termsLink}
                  onPress={() => Linking.openURL('https://www.usefarelo.com/terms')}
                >
                  Terms of Service
                </ThemedText>
                {' '}and{' '}
                <ThemedText 
                  style={styles.termsLink}
                  onPress={() => Linking.openURL('https://www.usefarelo.com/privacy')}
                >
                  Privacy Policy
                </ThemedText>
              </ThemedText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  form: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    color: '#793206',
    marginVertical: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#79320633',
  },
  orText: {
    color: '#793206',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  emailButton: {
    backgroundColor: '#793206',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#ede4d2',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  termsText: {
    color: '#793206',
    fontSize: 12,
    textAlign: 'center',
  },
  termsLink: {
    color: '#793206',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
})
