import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db';
import { IconSymbol } from './ui/IconSymbol';

interface RecipeDetailsProps {
  recipe: Recipe;
  onBack: () => void;
  onStartRecipe: () => void;
}

export default function RecipeDetails({ recipe, onBack, onStartRecipe }: RecipeDetailsProps) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <MaterialIcons name="arrow-back" size={24} color="#793206" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* Start Recipe Button */}
        <TouchableOpacity style={styles.startRecipeButton} onPress={onStartRecipe}>
          <Text style={styles.startRecipeText}>Start Recipe</Text>
        </TouchableOpacity>

        {/* Recipe Image */}
        <Image 
          source={{ uri: recipe.ai_image_url }} 
          style={styles.recipeImage}
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="refresh" size={24} color="#793206" />
            <Text style={styles.actionButtonText}>Remix</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="edit" size={24} color="#793206" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="delete" size={24} color="#793206" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.tagContainer}>
          {recipe.tags?.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider}/>

        {/* Ingredients */}
        <View>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book" color="#793206" size={24} />
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
          {recipe.ingredients?.map((ingredient, index) => (
            <View 
              key={index} 
              style={[
                styles.ingredient,
                index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
              ]}
            >
              <Text style={[
                styles.ingredientText,
                index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
              ]}>• {ingredient}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider}/>

        {/* Instructions */}
        <View>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book" color="#793206" size={24} />
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          {recipe.instructions?.map((instruction, index) => (
            <View 
              key={index}
              style={[
                styles.instruction,
                index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
              ]}
            >
              <Text style={[
                styles.instructionText,
                index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
              ]}>{index + 1}. {instruction}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider}/>

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

        <View style={styles.divider}/>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginBottom: 16,
    height: 40,
    borderRadius: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
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
  startRecipeButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  startRecipeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#793206',
    marginTop: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
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
  divider: {
    borderBottomColor: '#79320633',
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 18,
    flex: 1,
    marginBottom: 0,
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
}); 