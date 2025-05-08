import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const { profile } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Update Password" showBackButton />
      
      <View style={styles.section}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={password}
            placeholder="(minimum 6 characters)"
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Update</Text>
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
  },
  input: {
    fontSize: 16,
    color: '#793206'
  },
  inputContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  }, 
  buttonContainer: {
    paddingVertical: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#793206',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  }
});