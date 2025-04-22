import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Recipe } from '@/types/db';
import { useState, useEffect } from 'react';
import RecipeCard from '@/components/RecipeCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Partial<Recipe>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, ai_image_url, time, servings, tags, user_image_url')
        .order('created_at', { ascending: false })
        .eq('profile_id', profile?.id);

      if (error) {
        throw error;
      }

      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#793206" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (recipes.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No recipes found</Text>
        </View>
      );
    }

    return (
      <FlatList style={styles.recipeList} showsVerticalScrollIndicator={false} data={recipes} renderItem={({ item }) => (
        <RecipeCard key={item.id} recipe={item} />
      )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Buttons */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add new recipe</Text>
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchText}>Search</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={24} color="#603808" />
          </TouchableOpacity>
        </View>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#EDE4D2',
  },
  header: {
    gap: 16,
    marginBottom: 16,
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
