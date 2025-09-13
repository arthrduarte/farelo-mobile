import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  View,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { LogCard } from '@/components/log/LogCard';
import { ThemedView } from '@/components/ThemedView';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useInfiniteFeedLogs } from '@/hooks/logs';
import { useRecipes } from '@/hooks/recipes';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LogLoader } from '@/components/log/LogLoader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { WhoToFollow } from '@/components/home/WhoToFollow';
import { Introduction } from '@/components/home/Introduction';
import { RecentActiveUserLogs } from '@/components/home/RecentActiveUserLogs';
import { RecipeMilestone } from '@/components/home/RecipeMilestone';
import { EnhancedLog } from '@/types/types';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteFeedLogs(profile?.id ?? '');
  const { data: recipes, isLoading: recipesLoading } = useRecipes(profile?.id);

  const feed = data?.pages.flat() ?? [];

  useFocusEffect(
    useCallback(() => {
      if (profile?.id) {
        refetch();
      }
      return () => {};
    }, [profile?.id, refetch]),
  );

  const EmptyFeedComponent = () => (
    <>
      {!recipesLoading && (recipes?.length ?? 0) < 3 && <Introduction refreshFeed={refetch} />}
      <RecipeMilestone />
      <RecentActiveUserLogs />
    </>
  );

  const LoadingComponent = () => (
    <>
      <LogLoader />
      <LogLoader />
      <LogLoader />
    </>
  );

  const LoadMoreComponent = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="large" color="#793206" />
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item, index }: { item: EnhancedLog; index: number }) => {
    const isFirstItem = index === 0;
    return (
      <>
        <LogCard key={item.id} log={item} />
        {isFirstItem && <WhoToFollow />}
      </>
    );
  };

  const HeaderComponent = () => <RecipeMilestone />;

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title="Home"
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
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={isLoading ? LoadingComponent : EmptyFeedComponent}
        ListHeaderComponent={!recipesLoading && (recipes?.length ?? 0) < 3 ? HeaderComponent : null}
        ListFooterComponent={LoadMoreComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
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
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
