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
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'
import { supabase } from '@/lib/supabase'
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin'

const { width } = Dimensions.get('window')

export default function RegisterScreen() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    webClientId: '791951088468-breaeqj6q9ghgjqulnnb2mvkurm0rmei.apps.googleusercontent.com',
  })

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
        
        router.replace('/paywall')
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

  async function signUpWithEmail() {
    // Input Validations
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'First name cannot be empty.');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Last name cannot be empty.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email cannot be empty.');
      return;
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (!password) { // No trim() for password, as spaces might be intentional
      Alert.alert('Validation Error', 'Password cannot be empty.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })
      
      if (error) {
        console.error("[Register] Sign up error:", error.message)
        Alert.alert(error.message)
        return
      }
      
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

        router.replace('/paywall')
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

          <GoogleSigninButton
            style={{ width: '100%', height: 40 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={signInWithGoogle}
          />

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#793206"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#793206"
            value={lastName}
            onChangeText={setLastName}
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

          <TouchableOpacity
            style={styles.button}
            onPress={signUpWithEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ede4d2" style={{ marginRight: 10 }} />
            ) : null}
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
    flexDirection: 'row',
    justifyContent: 'center',
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
