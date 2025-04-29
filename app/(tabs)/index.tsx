import { StyleSheet, TouchableOpacity, Platform, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LogCard } from '@/components/LogCard';
import { Log } from '@/types/db';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useLogs } from '@/hooks/useLogs';
import { useRecipes } from '@/hooks/useRecipes';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { feed, ownLogs, loading, refresh } = useLogs(profile?.id ?? '');
  const { data: recipes, isLoading: isLoadingRecipes } = useRecipes(profile?.id ?? '');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTitlePlaceholder} />
        <TouchableOpacity onPress={() => router.push('/search')} style={styles.searchIconContainer}>
          <Feather name="search" size={24} color="#793206" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {feed.map((log) => (
          <LogCard 
            key={log.id}
            log={log}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#EDE4D2',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#79320633',
  },
  headerTitlePlaceholder: {
    width: 24,
  },
  searchIconContainer: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
});
