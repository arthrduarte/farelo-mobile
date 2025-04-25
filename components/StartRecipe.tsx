import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db';
import { IconSymbol } from './ui/IconSymbol';
import { useState } from 'react';

interface RecipeDetailsProps {
  recipe: Recipe;
  onBack: () => void;
  onFinish: () => void;
}

export default function RecipeDetails({ recipe, onBack, onFinish }: RecipeDetailsProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(
    new Array(recipe.ingredients?.length || 0).fill(false)
  );
  const [checkedInstructions, setCheckedInstructions] = useState<boolean[]>(
    new Array(recipe.instructions?.length || 0).fill(false)
  );

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

        {/* Recipe Image */}
        <Image 
          source={{ uri: recipe.ai_image_url }} 
          style={styles.recipeImage}
        />

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
                  {...checkedIngredients[index] ? {name: "checkbox-active", color: "#1D5D36", style: styles.activeCheckbox} : {name: "checkbox-inactive", color: "#793206"}}
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

        <View style={styles.divider}/>

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

        <View style={styles.divider}/>

        <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    borderBottomColor: '#79320633',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
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
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
