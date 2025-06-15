import { StyleSheet, TouchableOpacity, Platform, View, FlatList, Text } from 'react-native';
import { LogCard } from '@/components/LogCard';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useLogs } from '@/hooks/useLogs';
import { useRecipes } from '@/hooks/useRecipes';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LogLoader } from '@/components/log/LogLoader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { WhoToFollow } from '@/components/home/WhoToFollow';
import { Introduction } from '@/components/home/Introduction';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { feed, profileLogs, profileLogsLoading, refreshProfileLogs, refresh: refreshFeed } = useLogs(profile?.id ?? '');
  const { data: recipes, isLoading: isLoadingRecipes } = useRecipes(profile?.id ?? '');

  useFocusEffect(
    useCallback(() => {
      if (profile?.id) {
        refreshFeed();
      }
      return () => {
      };
    }, [profile?.id, refreshFeed])
  );

  const EmptyFeedComponent = () => (
    <>
      <Introduction refreshFeed={refreshFeed} />
      <WhoToFollow />
      <LogLoader />
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Follow people or start a recipe to see logs in your feed.
        </Text>
        <View style={styles.emptyActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/new-recipe')}
          >
            <Text style={styles.actionButtonText}>Add Recipe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const LoadingComponent = () => (
    <>
      <LogLoader />
      <Text style={styles.errorText}>If your app is stuck on loading, please restart it. We're working on fixing this issue!</Text>
      <LogLoader />
      <LogLoader />
    </>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isFirstItem = index === 0;
    return (
      <>
        <LogCard 
          key={item.id}
          log={item}
        />
        {isFirstItem && <WhoToFollow />}
      </>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Home" 
        rightItem={
          <TouchableOpacity onPress={() => router.push('/search')}>
            <Feather name="search" size={24} color="#793206" />
          </TouchableOpacity>
        }
      />

      <FlatList 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        data={feed}
        renderItem={renderItem}
        onRefresh={refreshFeed}
        refreshing={profileLogsLoading}
        ListEmptyComponent={profileLogsLoading ? LoadingComponent : EmptyFeedComponent}
      />
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
    backgroundColor: '#EDE4D2',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    margin: 16,
    fontSize: 14,
    textAlign: 'center',
    color: '#79320666',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#793206',
    marginBottom: 24,
  },
  emptyActions: {
    gap: 12,
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
