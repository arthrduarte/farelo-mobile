import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import { useRecipes } from '@/hooks/useRecipes';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export default function RecipesScreen() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const { data: recipes, isLoading, isError, error, refetch } = useRecipes(profile?.id, debouncedSearchTerm);

  const debouncedSetSearchTerm = useCallback(
    debounce((term) => {
      setDebouncedSearchTerm(term);
    }, 500),
    []
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
      <Text style={styles.emptyText}>
        No recipes found matching your search.
      </Text>
    </View>
  );

  const LoadingComponent = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#793206" />
    </View>
  );

  const ErrorComponent = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>{error?.message || 'Failed to load recipes. Please try again later.'}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header - Always visible */}
      <View style={styles.header}>
        <Link href="/new-recipe" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add new recipe</Text>
          </TouchableOpacity>
        </Link>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or tag..."
              placeholderTextColor="#79320680"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingComponent />
      ) : isError ? (
        <ErrorComponent />
      ) : (
        <FlatList 
          style={styles.recipeList} 
          showsVerticalScrollIndicator={false} 
          data={recipes} 
          renderItem={({ item }) => (
            <RecipeCard 
              key={item.id} 
              recipe={item} 
            />
          )}
          ListEmptyComponent={debouncedSearchTerm ? NoSearchResultsComponent : EmptyComponent}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    gap: 16,
    marginVertical: 16,
  },
  addButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: '#79320633',
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#793206',
  },
  recipeList: {
    flex: 1,
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
});
