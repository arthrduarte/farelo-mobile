import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { SUPERWALL_TRIGGERS } from '@/config/superwall'
import { useSuperwall } from '@/hooks/useSuperwall';

export default function Settings() {
  const { signOut } = useAuth();
  const { showPaywall } = useSuperwall();

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Settings" showBackButton />
      
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/profile/edit')}>
            <View style={styles.cardContent}>
              <Feather name="user" size={24} color="#793206" />
              <Text style={styles.cardTitle}>Profile</Text>
            </View>
            <View>
              <Feather name="chevron-right" size={24} color="#793206" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/settings/account/main')}>
            <View style={styles.cardContent}>
              <Feather name="lock" size={24} color="#793206" />
              <Text style={styles.cardTitle}>Account</Text>
            </View>
            <View>
              <Feather name="chevron-right" size={24} color="#793206" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => router.push('/paywall')}>
            <View style={styles.cardContent}>
              <Feather name="star" size={24} color="#793206" />
              <Text style={styles.cardTitle}>Upgrade to Pro</Text>
            </View>
            <View>
              <Feather name="chevron-right" size={24} color="#793206" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSection}>
          <Text style={styles.contact}>Contact us: team.usefarelo@gmail.com</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutButtonText}>Logout</Text>
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


