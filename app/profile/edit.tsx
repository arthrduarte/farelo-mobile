import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useState } from 'react';
import 'react-native-url-polyfill/auto';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useUpdateProfile } from '@/hooks/profile/useUpdateProfile';

export default function EditProfile() {
  const { profile, refreshProfile } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? null,
    username: profile?.username || '',
  });
  const { mutate, isLoading } = useUpdateProfile();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!profile?.id) {
      Alert.alert('Error', 'Profile not found');
      return;
    }

    mutate(
      {
        userId: profile.id,
        currentUsername: profile.username || '',
        formData,
        selectedImage,
        currentImage: profile.image,
      },
      {
        onSuccess: async () => {
          await refreshProfile();
          Alert.alert('Success', 'Profile updated successfully');
          router.back();
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to update profile');
        },
      },
    );
  };

  return (
    <ThemedView style={styles.safeArea}>
      <ScreenHeader
        title="Edit Profile"
        showBackButton={true}
        rightItem={
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={handleImagePick}>
              <Image
                style={styles.avatar}
                source={{
                  uri: selectedImage || profile?.image || 'https://via.placeholder.com/150',
                }}
              />
              <Text style={styles.changePicture}>Change Picture</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Public profile data</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, first_name: text }))}
                placeholder="Your first name"
                placeholderTextColor="#79320680"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name || ''}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, last_name: text || null }))
                }
                placeholder="Your last name"
                placeholderTextColor="#79320680"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, username: text }))}
                placeholder="Your username"
                placeholderTextColor="#79320680"
                keyboardType="default"
                autoCapitalize="none"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EDE4D2',
  },
  headerTitle: {
    fontSize: 24,
    marginTop: 12,
    color: '#793206',
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  imageSection: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EDE4D2',
    marginBottom: 8,
  },
  changePicture: {
    color: '#793206',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#79320680',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#793206',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#793206',
    borderBottomWidth: 1,
    borderBottomColor: '#79320633',
    paddingVertical: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#79320633',
    paddingVertical: 8,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#793206',
  },
  saveButton: {
    backgroundColor: '#793206',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
});
