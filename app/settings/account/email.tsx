import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useChangeEmail } from '@/hooks/auth/useChangeEmail';

export default function ChangeEmail() {
  const [email, setEmail] = useState('');
  const { profile } = useAuth();
  const changeEmailMutation = useChangeEmail();

  const handleChangeEmail = () => {
    changeEmailMutation.mutate(
      {
        newEmail: email,
        currentEmail: profile?.email || '',
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Success',
            'A confirmation email has been sent to your new email address. Please check your inbox and follow the instructions to complete the change.',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ],
          );
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      },
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Change Email" showBackButton />

      <View style={styles.section}>
        <Text style={styles.label}>Current Email</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currentEmail}>{profile?.email}</Text>
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>New Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter new email"
            placeholderTextColor="#79320633"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, changeEmailMutation.isPending && styles.buttonDisabled]}
            onPress={handleChangeEmail}
            disabled={changeEmailMutation.isPending}
          >
            {changeEmailMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Change Email</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#793206',
  },
  label: {
    fontSize: 16,
    color: '#793206',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#793206',
    padding: 0,
  },
  currentEmail: {
    fontSize: 16,
    color: '#793206',
    opacity: 0.7,
  },
  inputContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  buttonContainer: {
    paddingVertical: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#793206',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
});
