import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
  TextInput,
  Animated,
} from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { Link, router } from 'expo-router';
import { useInfiniteRecipes } from '@/hooks/recipes';
import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import Drawer from '@/components/ui/Drawer';

export default function RecipesScreen() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchBarHeight = useRef(new Animated.Value(0)).current;
  const searchBarOpacity = useRef(new Animated.Value(0)).current;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(0)).current;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteRecipes(profile?.id, debouncedSearchTerm);

  const recipes = data?.pages.flat() ?? [];

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;

    Animated.spring(drawerAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();

    setIsDrawerOpen(!isDrawerOpen);
  };

  const drawerOptions = [
    {
      icon: 'link' as keyof typeof MaterialIcons.glyphMap,
      text: 'Import Link',
      onPress: () => {
        router.push({ pathname: '/new-recipe', params: { importMethod: 'link' } });
        toggleDrawer();
      },
    },
    {
      icon: 'photo-library' as keyof typeof MaterialIcons.glyphMap,
      text: 'Select from Gallery',
      onPress: () => {
        router.push({ pathname: '/new-recipe', params: { importMethod: 'image' } });
        toggleDrawer();
      },
    },
    {
      icon: 'edit-note' as keyof typeof MaterialIcons.glyphMap,
      text: 'Add Manually',
      onPress: () => {
        router.push({ pathname: '/new-recipe', params: { importMethod: 'manual' } });
        toggleDrawer();
      },
    },
  ];

  const toggleSearch = () => {
    const toValue = isSearchVisible ? 0 : 1;
    setIsSearchVisible(!isSearchVisible);

    Animated.parallel([
      Animated.timing(searchBarHeight, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchBarOpacity, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    if (isSearchVisible) {
      setSearchQuery('');
      setDebouncedSearchTerm('');
    }
  };

  const debouncedSetSearchTerm = useCallback(
    debounce((term) => {
      setDebouncedSearchTerm(term);
    }, 500),
    [],
  );

  useEffect(() => {
    debouncedSetSearchTerm(searchQuery);
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [searchQuery, debouncedSetSearchTerm]);

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        You haven't added any recipes yet.{'\n'}
        Start by adding your first recipe!
      </Text>
    </View>
  );

  const NoSearchResultsComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No recipes found matching your search.</Text>
    </View>
  );

  const LoadingComponent = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#793206" />
    </View>
  );

  const LoadMoreComponent = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#793206" />
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const ErrorComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>
        {error?.message || 'Failed to load recipes. Please try again later.'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title="Recipes"
        rightItem={
          <TouchableOpacity onPress={toggleSearch}>
            <Feather name={isSearchVisible ? 'x' : 'search'} size={24} color="#793206" />
          </TouchableOpacity>
        }
        leftItem={
          <TouchableOpacity style={styles.addButton} onPress={toggleDrawer}>
            <Feather name="plus" size={16} color="white" />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        }
      />

      <Animated.View
        style={[
          styles.searchContainer,
          {
            maxHeight: searchBarHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 80],
            }),
            opacity: searchBarOpacity,
            overflow: 'hidden',
          },
        ]}
      >
        <View style={styles.searchButton}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or tag..."
            placeholderTextColor="#79320680"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={isSearchVisible}
          />
        </View>
      </Animated.View>

      {isLoading ? (
        <LoadingComponent />
      ) : isError ? (
        <ErrorComponent />
      ) : (
        <FlatList
          style={styles.recipeList}
          showsVerticalScrollIndicator={false}
          data={recipes}
          renderItem={({ item }) => <RecipeCard key={item.id} recipe={item} />}
          ListEmptyComponent={debouncedSearchTerm ? NoSearchResultsComponent : EmptyComponent}
          ListFooterComponent={LoadMoreComponent}
          refreshing={isLoading}
          onRefresh={refetch}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
        />
      )}
      <Drawer
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        drawerAnimation={drawerAnimation}
        options={drawerOptions}
        title="Import Options"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  addButton: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#793206',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#79320633',
    borderRadius: 8,
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#793206',
  },
  recipeList: {
    flex: 1,
    paddingHorizontal: 16,
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  },
  errorText: {
    color: '#793206',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#793206',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#793206',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
