import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db';
import { router } from 'expo-router';

interface RecipeCardProps {
  recipe: Partial<Recipe>;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {

  return (
    <TouchableOpacity onPress={() => router.push(`/recipe/${recipe.id}/details`)}>
      <View style={styles.recipeCard}>
        {recipe.user_image_url ? (
          <Image 
            source={{ uri: recipe.user_image_url }} 
            style={styles.recipeImage}
          />
        ) : (
          <Image 
            source={{ uri: recipe.ai_image_url }} 
            style={styles.recipeImage}
          />
        )}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <View style={styles.tagContainer}>
            {recipe.tags?.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
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
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#79320633',
    borderRadius: 12,
    marginVertical: 12,
    overflow: 'hidden',
  },
  recipeImage: {
    width: 100,
    // height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#793206',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
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
    color: '#793206',
    fontSize: 14,
  },
});
