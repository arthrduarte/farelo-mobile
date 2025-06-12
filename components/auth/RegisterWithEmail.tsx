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

const { width } = Dimensions.get('window')

export const RegisterWithEmail = () => {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signUpWithEmail() {
    // Input Validations
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'First name cannot be empty.')
      return
    }
    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Last name cannot be empty.')
      return
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email cannot be empty.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.')
      return
    }
    if (!password) {
      Alert.alert('Validation Error', 'Password cannot be empty.')
      return
    }
    if (password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.')
      return
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
    <View style={styles.container}>
      <Text style={styles.orText}>Or</Text>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  orText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
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