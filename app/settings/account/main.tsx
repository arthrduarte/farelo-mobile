import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AccountSettings() {

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
      } },
    ]);
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Account Settings" showBackButton />
      
      <ScrollView>
        <View style={styles.section}>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/settings/account/email')}>
            <View style={styles.cardContent}>
              <Feather name="mail" size={24} color="#793206" />
              <Text style={styles.cardTitle}>Change Email</Text>
            </View>
            <View>
              <Feather name="chevron-right" size={24} color="#793206" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/settings/account/password')}>
            <View style={styles.cardContent}>
              <Feather name="lock" size={24} color="#793206" />
              <Text style={styles.cardTitle}>Update Password</Text>
            </View>
            <View>
              <Feather name="chevron-right" size={24} color="#793206" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleDeleteAccount}>
            <Text style={styles.logoutButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#793206',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  cardTitle: {
    fontSize: 18,
    color: '#793206',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contact: {
    fontSize: 16,
    color: '#793206',
  },
  contactText: {
    fontSize: 18,
    color: '#793206',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },  
  logoutButtonText: {
    fontSize: 18,
    color: '#793206',
  },
});


