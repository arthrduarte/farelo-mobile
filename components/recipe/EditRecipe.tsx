import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe as BaseRecipe } from '@/types/db';
import { IconSymbol } from '../ui/IconSymbol';
import { useState } from 'react';
import TagManager from './edit/TagManager';
import { PulsingPlaceholder } from './ImagePlaceholder';

interface Recipe extends BaseRecipe {
  newTag?: string;
}

interface EditRecipeProps {
    recipe: Recipe;
    onBack: () => void;
    onUpdate: (recipe: Recipe) => void;
}

interface ValidationErrors {
    title?: string;
    time?: string;
    servings?: string;
    ingredients?: string;
    instructions?: string;
    tags?: string;
}

export default function EditRecipe({ recipe, onBack, onUpdate }: EditRecipeProps) {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({});
  const [isTagManagerVisible, setIsTagManagerVisible] = useState(false);

  const validateField = (field: keyof Recipe, value: any): string | undefined => {
    switch (field) {
      case 'title':
        return !value ? 'Title is required' : undefined;
      case 'time':
        return !value || value < 1 ? 'Time must be at least 1 minute' : undefined;
      case 'servings':
        return !value || value < 1 ? 'Servings must be at least 1' : undefined;
      case 'tags':
        if (typeof value === 'string' && value.length > 12) {
          return 'Tag must be 12 characters or less';
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleUpdate = () => {
    const newErrors: ValidationErrors = {};
    Object.keys(editedRecipe).forEach((key) => {
      const error = validateField(key as keyof Recipe, editedRecipe[key as keyof Recipe]);
      if (error) {
        newErrors[key as keyof ValidationErrors] = error;
      }
    });

    if (Object.keys(newErrors).length === 0) {
      onUpdate(editedRecipe);
    } else {
      setErrors(newErrors);
    }
  };

  const startEditing = (field: string) => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
  };

  const stopEditing = (field: string) => {
    setIsEditing(prev => ({ ...prev, [field]: false }));
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <MaterialIcons name="arrow-back" size={24} color="#793206" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        {isEditing.title ? (
          <TextInput
            style={[styles.title, styles.input]}
            value={editedRecipe.title}
            onChangeText={(text) => setEditedRecipe(prev => ({ ...prev, title: text }))}
            onBlur={() => stopEditing('title')}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => startEditing('title')}>
            <Text style={styles.title}>{editedRecipe.title}</Text>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </TouchableOpacity>
        )}

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <View style={styles.timeIcon}>
              <MaterialIcons name="schedule" size={16} color="#603808" />
            </View>
            {isEditing.time ? (
              <TextInput
                style={[styles.metaText, styles.input]}
                value={String(editedRecipe.time)}
                onChangeText={(text) => {
                  const numValue = parseInt(text) || 0;
                  setEditedRecipe(prev => ({ ...prev, time: numValue }));
                }}
                onBlur={() => stopEditing('time')}
                keyboardType="numeric"
                autoFocus
              />
            ) : (
              <TouchableOpacity onPress={() => startEditing('time')}>
                <Text style={styles.metaText}>{editedRecipe.time} mins</Text>
                {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.metaItem}>
            <View style={styles.servingsIcon}>
              <MaterialIcons name="people" size={16} color="#603808" />
            </View>
            {isEditing.servings ? (
              <TextInput
                style={[styles.metaText, styles.input]}
                value={String(editedRecipe.servings)}
                onChangeText={(text) => {
                  const numValue = parseInt(text) || 0;
                  setEditedRecipe(prev => ({ ...prev, servings: numValue }));
                }}
                onBlur={() => stopEditing('servings')}
                keyboardType="numeric"
                autoFocus
              />
            ) : (
              <TouchableOpacity onPress={() => startEditing('servings')}>
                <Text style={styles.metaText}>{editedRecipe.servings} servings</Text>
                {errors.servings && <Text style={styles.errorText}>{errors.servings}</Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Recipe Image */}
        {editedRecipe.ai_image_url ? (
          <Image 
            source={{ uri: editedRecipe.ai_image_url }} 
            style={styles.recipeImage}
          />
        ) : (
          <PulsingPlaceholder />
        )}

        {/* Action Buttons */}
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>

        {/* Tags */}
        <View style={styles.tagContainer}>
          {editedRecipe.tags?.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.manageTag}
            onPress={() => setIsTagManagerVisible(true)}
          >
            <MaterialIcons name="settings" size={16} color="white" />
            <Text style={styles.tagText}>Manage</Text>
          </TouchableOpacity>
        </View>

        <TagManager
          visible={isTagManagerVisible}
          onClose={() => setIsTagManagerVisible(false)}
          tags={editedRecipe.tags || []}
          onUpdateTags={(newTags) => {
            setEditedRecipe(prev => ({ ...prev, tags: newTags }));
          }}
        />

        <View style={styles.divider}/>

        {/* Ingredients */}
        <View>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book" color="#793206" size={24} />
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
          {editedRecipe.ingredients?.map((ingredient, index) => (
            <View 
              key={index} 
              style={[
                styles.ingredient,
                index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
              ]}
            >
              {isEditing[`ingredient_${index}`] ? (
                <TextInput
                  style={[
                    styles.ingredientText,
                    styles.input,
                    index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
                  ]}
                  value={ingredient}
                  onChangeText={(text) => {
                    const newIngredients = [...(editedRecipe.ingredients || [])];
                    newIngredients[index] = text;
                    setEditedRecipe(prev => ({ ...prev, ingredients: newIngredients }));
                  }}
                  onBlur={() => stopEditing(`ingredient_${index}`)}
                  autoFocus
                />
              ) : (
                <TouchableOpacity 
                  style={styles.editableRow}
                  onPress={() => startEditing(`ingredient_${index}`)}
                >
                  <Text style={[
                    styles.ingredientText,
                    index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
                  ]}>• {ingredient}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newIngredients = [...(editedRecipe.ingredients || [])];
                      newIngredients.splice(index, 1);
                      setEditedRecipe(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="close" size={20} color="#793206" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addButton, styles.ingredientBrown]}
            onPress={() => {
              const newIngredients = [...(editedRecipe.ingredients || []), ''];
              setEditedRecipe(prev => ({ ...prev, ingredients: newIngredients }));
              startEditing(`ingredient_${newIngredients.length - 1}`);
            }}
          >
            <MaterialIcons name="add" size={20} color="#793206" />
            <Text style={[styles.addButtonText, styles.textOnBrown]}>Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}/>

        {/* Instructions */}
        <View>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book" color="#793206" size={24} />
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          {editedRecipe.instructions?.map((instruction, index) => (
            <View 
              key={index}
              style={[
                styles.instruction,
                index % 2 === 0 ? styles.ingredientBrown : styles.ingredientBeige,
              ]}
            >
              {isEditing[`instruction_${index}`] ? (
                <TextInput
                  style={[
                    styles.instructionText,
                    styles.input,
                    index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
                  ]}
                  value={instruction}
                  onChangeText={(text) => {
                    const newInstructions = [...(editedRecipe.instructions || [])];
                    newInstructions[index] = text;
                    setEditedRecipe(prev => ({ ...prev, instructions: newInstructions }));
                  }}
                  onBlur={() => stopEditing(`instruction_${index}`)}
                  autoFocus
                  multiline
                />
              ) : (
                <TouchableOpacity 
                  style={styles.editableRow}
                  onPress={() => startEditing(`instruction_${index}`)}
                >
                  <Text style={[
                    styles.instructionText,
                    index % 2 === 0 ? styles.textOnBrown : styles.textOnBeige
                  ]}>{index + 1}. {instruction}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const newInstructions = [...(editedRecipe.instructions || [])];
                      newInstructions.splice(index, 1);
                      setEditedRecipe(prev => ({ ...prev, instructions: newInstructions }));
                    }}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="close" size={20} color="#793206" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={[styles.addButton, styles.ingredientBrown]}
            onPress={() => {
              const newInstructions = [...(editedRecipe.instructions || []), ''];
              setEditedRecipe(prev => ({ ...prev, instructions: newInstructions }));
              startEditing(`instruction_${newInstructions.length - 1}`);
            }}
          >
            <MaterialIcons name="add" size={20} color="#793206" />
            <Text style={[styles.addButtonText, styles.textOnBrown]}>Add Instruction</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}/>

        {/* Notes */}
        <View>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book" color="#793206" size={24} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <View style={styles.notesContainer}>
            {isEditing.notes ? (
              <TextInput
                style={[styles.notesText, styles.input, styles.textOnBrown]}
                value={editedRecipe.notes || ''}
                onChangeText={(text) => setEditedRecipe(prev => ({ ...prev, notes: text }))}
                onBlur={() => stopEditing('notes')}
                multiline
                autoFocus
                placeholder="Add your notes here..."
              />
            ) : (
              <TouchableOpacity onPress={() => startEditing('notes')}>
                <Text style={[styles.notesText, styles.textOnBrown]}>
                  {editedRecipe.notes || 'No notes added yet.'}
                </Text>
              </TouchableOpacity>
            )}
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
  updateButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    // borderWidth: 1,
    // borderColor: '#793206',
    // padding: 8,
    // borderRadius: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  removeTag: {
    padding: 4,
  },
  tagInput: {
    padding: 8,
  },
  addTag: {
    padding: 8,
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  manageTag: {
    flexDirection: 'row',
    borderColor: '#793206',
    backgroundColor: '#793206',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
}); 