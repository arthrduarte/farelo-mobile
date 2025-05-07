import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import { useRecipes } from '@/hooks/useRecipes';

export default function RecipesScreen() {
  const { profile } = useAuth();
  const { data: recipes, isLoading, isError, error, refetch } = useRecipes(profile?.id);

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        You haven't added any recipes yet.{'\n'}
        Start by adding your first recipe!
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
            <Text style={styles.searchText}>Search</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#603808" />
          </TouchableOpacity>
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
          ListEmptyComponent={EmptyComponent}
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
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: '#79320633',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchText: {
    color: '#793206',
    fontSize: 16,
    opacity: 0.6,
  },
  filterButton: {
    backgroundColor: '#EDE4D2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
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
