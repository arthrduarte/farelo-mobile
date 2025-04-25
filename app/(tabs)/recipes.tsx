import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Recipe } from '@/types/db';
import { useState, useEffect, useCallback } from 'react';
import RecipeCard from '@/components/recipe/RecipeCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import RecipeDetails from '@/components/recipe/RecipeDetails';
import StartRecipe from '@/components/recipe/StartRecipe';
import FinishRecipe from '@/components/FinishRecipe';
import EditRecipe from '@/components/recipe/EditRecipe';
import { useNavigation } from 'expo-router';
import { Link } from 'expo-router';

export default function RecipesScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation();

  const [recipes, setRecipes] = useState<Partial<Recipe>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [startedRecipe, setStartedRecipe] = useState<Recipe | null>(null);
  const [finishedRecipe, setFinishedRecipe] = useState<Recipe | null>(null);

  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    // Hide tab bar when EditRecipe is shown
    navigation.setOptions({
      tabBarStyle: {
        display: editRecipe ? 'none' : 'flex',
        backgroundColor: '#EDE4D2',
        borderTopWidth: 0,
      }
    });
  }, [editRecipe]);

  const fetchRecipes = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
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
      setIsRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const renderContent = () => {
    if (finishedRecipe) {
      return (
        <FinishRecipe 
          recipe={finishedRecipe} 
          onBack={() => setFinishedRecipe(null)} 
          setFinishedRecipe={setFinishedRecipe}
          setSelectedRecipe={setSelectedRecipe}
          setStartedRecipe={setStartedRecipe}
          onRefreshRecipes={fetchRecipes}
        />
      );
    } 
    if (startedRecipe) {
      return (
        <StartRecipe 
          recipe={startedRecipe} 
          onBack={() => setStartedRecipe(null)} 
          onFinish={() => setFinishedRecipe(startedRecipe)}
        />
      );
    }

    if (selectedRecipe) {
      if(editRecipe){
        return (
          <EditRecipe
            recipe={editRecipe} 
            onBack={() => setEditRecipe(null)} 
            onUpdate={async (updatedRecipe) => {
              const { data,error } = await supabase
                .from('recipes')
                .update(updatedRecipe)
                .eq('id', updatedRecipe.id)
                .select();
              if (!error) {
                fetchRecipes();
                setEditRecipe(null);
                setSelectedRecipe(data[0]);
              }
            }}
          />
        );
      }
      return (
        <RecipeDetails 
          recipe={selectedRecipe} 
          onBack={() => setSelectedRecipe(null)} 
          onStartRecipe={() => setStartedRecipe(selectedRecipe)} 
          setEditRecipe={setEditRecipe}
          onDelete={async (recipeToDelete) => {
            const { error } = await supabase
              .from('recipes')
              .delete()
              .eq('id', recipeToDelete.id);
            
            if (!error) {
              setSelectedRecipe(null);
              fetchRecipes();
            }
          }}
          onRecipeUpdate={(updatedRecipe) => {
            setSelectedRecipe(updatedRecipe);
            fetchRecipes();
          }}
        />
      );
    }

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
      <>
        {/* Header Buttons */}
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

        <FlatList 
          style={styles.recipeList} 
          showsVerticalScrollIndicator={false} 
          data={recipes} 
          renderItem={({ item }) => (
            <RecipeCard 
              key={item.id} 
              recipe={item} 
              onPress={() => setSelectedRecipe(item as Recipe)} 
            />
          )}
          refreshing={isRefreshing}
          onRefresh={fetchRecipes}
        />
      </>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {renderContent()}
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
