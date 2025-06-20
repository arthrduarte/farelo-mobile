import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/ThemedText'
import { supabase } from '@/lib/supabase'
import { ForgotPassword } from './ForgotPassword'
import { usePaywall } from '@/contexts/PaywallContext'

const { width } = Dimensions.get('window')

export const LoginWithEmail = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { showPaywall } = usePaywall()

  async function signInWithEmail() {
    // Input Validations
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
    if (!password) { // No trim() for password
      Alert.alert('Validation Error', 'Password cannot be empty.');
      return;
    }

    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      
      if (error) {
        console.error("[Login] Sign in error:", error.message)
        Alert.alert(error.message)
        return
      }

      showPaywall()
      router.replace('/');
      
    } catch (err) {
      console.error("[Login] Unexpected error:", err)
      Alert.alert("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
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

      <TouchableOpacity
        style={styles.button}
        onPress={signInWithEmail}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ede4d2" style={{ marginRight: 10 }} />
        ) : null}
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          Login
        </ThemedText>
      </TouchableOpacity>

      <ForgotPassword />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
}) 