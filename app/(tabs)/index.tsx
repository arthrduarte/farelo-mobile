import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LogCard } from '@/components/LogCard';
import { Log } from '@/types/db';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useLogs } from '@/hooks/useLogs';
import { useRecipes } from '@/hooks/useRecipes';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { feed, ownLogs, loading, refresh } = useLogs(profile?.id ?? '');
  const { data: recipes, isLoading: isLoadingRecipes } = useRecipes(profile?.id ?? '');

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
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
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
  },
});
