import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { supabase } from '@/lib/supabase'

const { width } = Dimensions.get('window')

export const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  async function resetPassword() {
    // Input validation
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email cannot be empty.')
      return
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.')
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://your-app.com/reset-password', // Update this to your app's deep link
      })
      
      if (error) {
        console.error("[ForgotPassword] Reset password error:", error.message)
        Alert.alert('Error', error.message)
        return
      }
      
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for password reset instructions.',
        [
          {
            text: 'OK',
            onPress: () => {
              setEmail('')
              setModalVisible(false)
            }
          }
        ]
      )
      
    } catch (err) {
      console.error("[ForgotPassword] Unexpected error:", err)
      Alert.alert('Error', 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setModalVisible(false)
    setEmail('')
  }

  return (
    <>
      <TouchableOpacity
        style={styles.forgotPasswordButton}
        // onPress={() => setModalVisible(true)}
        onPress={() => Alert.alert('Please contact team.usefarelo@gmail.com to reset your password')}
      >
        <ThemedText style={styles.forgotPasswordText}>
          Forgot password?
        </ThemedText>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>
              Reset Password
            </ThemedText>
            
            <ThemedText style={styles.modalDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#793206"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={closeModal}
                disabled={loading}
              >
                <ThemedText style={styles.cancelButtonText}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={resetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ede4d2" style={{ marginRight: 10 }} />
                ) : null}
                <ThemedText style={styles.resetButtonText}>
                  Send Reset Link
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#793206',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ede4d2',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    color: '#793206',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#793206',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 24,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#793206',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#793206',
  },
  resetButtonText: {
    color: '#ede4d2',
    fontSize: 16,
    fontWeight: '600',
  },
}) 