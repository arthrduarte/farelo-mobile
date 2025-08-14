import {
  ScrollView,
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
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChangePassword } from '@/hooks/auth/useChangePassword';

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { profile } = useAuth();
  const changePasswordMutation = useChangePassword();

  const handleUpdatePassword = () => {
    changePasswordMutation.mutate(
      {
        currentPassword,
        newPassword,
        confirmPassword,
        email: profile?.email || '',
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Your password has been updated successfully', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      },
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Update Password" showBackButton />

      <View style={styles.section}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor="#79320633"
            secureTextEntry={!showCurrentPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            style={styles.eyeIcon}
          >
            <Feather name={showCurrentPassword ? 'eye' : 'eye-off'} size={20} color="#793206" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Minimum 6 characters"
            placeholderTextColor="#79320633"
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}
          >
            <Feather name={showNewPassword ? 'eye' : 'eye-off'} size={20} color="#793206" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>Confirm New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            placeholderTextColor="#79320633"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Feather name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#793206" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, changePasswordMutation.isPending && styles.buttonDisabled]}
            onPress={handleUpdatePassword}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
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
    flex: 1,
    padding: 0,
  },
  inputContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    padding: 4,
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
