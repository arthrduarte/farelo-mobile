import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LogCard } from '@/components/LogCard';
import { Log } from '@/types/db';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { useLogs } from '@/hooks/useLogs';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { feed, loading, refresh } = useLogs(profile?.id ?? '');

  const handleLike = (logId: string) => {
    // Handle like action
    console.log('Liked post:', logId);
  };

  const handleComment = (logId: string) => {
    // Handle comment action
    console.log('Comment on post:', logId);
  };

  const handleAdd = (logId: string) => {
    // Handle add action
    console.log('Added post:', logId);
  };

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
            onLike={() => handleLike(log.id)}
            onComment={() => handleComment(log.id)}
            onAdd={() => handleAdd(log.id)}
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
