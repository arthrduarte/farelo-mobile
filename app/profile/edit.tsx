import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, SafeAreaView } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile() {
  const { profile } = useAuth();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // TODO: Handle image upload
      console.log(result.assets[0].uri);
    }
  };

  return (
    <ThemedView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#793206" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ThemedView style={styles.container}>
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={handleImagePick}>
            <Image 
              style={styles.avatar} 
              source={{ uri: profile?.image || 'https://via.placeholder.com/150' }} 
            />
            <Text style={styles.changePicture}>Change Picture</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Public profile data</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={profile?.first_name + ' ' + profile?.last_name}
              placeholder="Your name"
              placeholderTextColor="#79320680"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={profile?.username}
              placeholder="Your username"
              placeholderTextColor="#79320680"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={() => console.log('Save')}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
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
  imageSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  changePicture: {
    color: '#793206',
    fontSize: 16,
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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
