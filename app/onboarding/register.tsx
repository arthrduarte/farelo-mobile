// screens/register.tsx

import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { supabase } from '@/lib/supabase'
import { SUPERWALL_TRIGGERS } from '@/config/superwall'
import { useSuperwall } from '@/hooks/useSuperwall';

const { width } = Dimensions.get('window')

export default function RegisterScreen() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { showPaywall } = useSuperwall();

  async function signUpWithEmail() {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: fullName.split(' ')[0],
            last_name: fullName.split(' ')[1],
          },
        },
      })
      
      if (error) {
        console.error("[Register] Sign up error:", error.message)
        Alert.alert(error.message)
        return
      }
      
      await showPaywall(SUPERWALL_TRIGGERS.ONBOARDING);
      
      // To avoid circular navigation, delay the redirection slightly
      setTimeout(async () => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })

        if (error) {
          console.error("[Register] Sign in error:", error.message)
          Alert.alert(error.message)
          return
        }

        router.replace('/')
      }, 100)
    } catch (err) {
      console.error("[Register] Unexpected error:", err)
      Alert.alert("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.form}>
          <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
          <ThemedText type="title" style={styles.heading}>
            Create Account
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#793206"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#793206"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#793206"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#793206"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.button} onPress={signUpWithEmail}>
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Register
            </ThemedText>
          </TouchableOpacity>

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
  input: {
    width: width - 48,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#793206',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ede4d2',
    fontSize: 18,
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
