import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useRecipe } from '@/hooks/useRecipes';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useState, useEffect } from 'react';
import { Divider } from '@/components/Divider';
import { ImagesSection } from '@/components/recipe/RecipeImage';
import ChatBubble from '@/components/ChatBubble';

export default function StartRecipeScreen() {
  const { recipeId } = useLocalSearchParams();
  const { profile } = useAuth();
  const { data: recipe, isLoading, isError } = useRecipe(recipeId as string, profile?.id);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [checkedInstructions, setCheckedInstructions] = useState<boolean[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer functionality - starts automatically
  useEffect(() => {
    const intervalId = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Initialize checked states when recipe is loaded
  if (recipe && checkedIngredients.length === 0) {
    setCheckedIngredients(new Array(recipe.ingredients?.length || 0).fill(false));
    setCheckedInstructions(new Array(recipe.instructions?.length || 0).fill(false));
  }

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  const toggleInstruction = (index: number) => {
    setCheckedInstructions(prev => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#793206" />
      </ThemedView>
    );
  }

  if (isError || !recipe) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Start Recipe" 
        leftItem={
          <View style={styles.timerContainer}>
            <MaterialIcons name="timer" size={24} color="#793206" />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
        }
        rightItem={
        // FINISH
        <TouchableOpacity 
          style={styles.finishButton}
          onPress={() => router.push({
            pathname: '/recipe/[recipeId]/finish',
            params: { recipeId: recipe.id }
          })}
        >
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
        }
      />
      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>{recipe.title}</Text>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <View style={styles.timeIcon}>
              <MaterialIcons name="schedule" size={16} color="#603808" />
            </View>
            <Text style={styles.metaText}>{recipe.time} mins</Text>
          </View>
          <View style={styles.metaItem}>
            <View style={styles.servingsIcon}>
              <MaterialIcons name="people" size={16} color="#603808" />
            </View>
            <Text style={styles.metaText}>{recipe.servings} servings</Text>
          </View>
        </View>

        {/* Recipe Image */}
        {recipe.user_image_url ? (
          <ImagesSection mainImage={recipe.user_image_url} />
        ) : (
          <ImagesSection mainImage={recipe.ai_image_url} />
        )}

        <Divider />

        {/* Ingredients */}
        <View>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book" color="#793206" size={24} />
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
          {recipe.ingredients?.map((ingredient, index) => (
            <TouchableOpacity 
              activeOpacity={1}
              key={index} 
              style={[
                styles.ingredient,
                index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
                checkedIngredients[index] && styles.ingredientChecked
              ]}
            >
              <TouchableOpacity 
                style={styles.checkboxContainer}
                activeOpacity={0.5}
                onPress={() => toggleIngredient(index)}
              >
                <IconSymbol 
                  {...checkedIngredients[index] 
                    ? {name: "checkbox-active", color: "#1D5D36", style: styles.activeCheckbox} 
                    : {name: "checkbox-inactive", color: "#793206"}
                  }
                  size={24} 
                />
              </TouchableOpacity>
              <Text style={[
                styles.ingredientText,
                index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
              ]}>{ingredient}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Divider />

        {/* Instructions */}
        <View>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book" color="#793206" size={24} />
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          {recipe.instructions?.map((instruction, index) => (
            <TouchableOpacity 
              key={index}
              activeOpacity={1}
              style={[
                styles.instruction,
                index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
                checkedInstructions[index] && styles.ingredientChecked
              ]}
            >
              <TouchableOpacity 
                style={styles.checkboxContainer}
                activeOpacity={0.5}
                onPress={() => toggleInstruction(index)}
              >
                <IconSymbol 
                  {...checkedInstructions[index] 
                    ? {name: "checkbox-active", color: "#1D5D36", style: styles.activeCheckbox} 
                    : {name: "checkbox-inactive", color: "#793206"}
                  }
                  size={24} 
                />
              </TouchableOpacity>
              <Text style={[
                styles.instructionText,
                index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
              ]}>{index + 1}. {instruction}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Divider />

        {/* Notes */}
        <View>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book" color="#793206" size={24} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <View style={styles.notesContainer}>
            <Text style={[styles.notesText, styles.textOnBrown]}>
              {recipe.notes || 'No notes added yet.'}
            </Text>
          </View>
        </View>

        <Divider />
      </ScrollView>
      <ChatBubble />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#793206',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 16,
    color: '#793206',
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  ingredientBrown: {
    backgroundColor: '#79320633',
  },
  ingredientBeige: {
    backgroundColor: '#EDE4D2',
  },
  ingredientChecked: {
    backgroundColor: '#329F5B',  // A nice material design green
  },
  activeCheckbox: {
    shadowColor: '#1D5D36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkboxContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientText: {
    fontSize: 18,
    flex: 1,
    marginBottom: 0,
  },
  textOnBrown: {
    color: '#793206',
  },
  textOnBeige: {
    color: '#793206',
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 18,
    flex: 1,
    marginBottom: 0,
  },
  finishButton: {
    backgroundColor: '#793206',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  finishButtonText: {
    color: 'white',
  },
  notesContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  notesText: {
    fontSize: 18,
    lineHeight: 24,
  },
  errorText: {
    color: '#793206',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
