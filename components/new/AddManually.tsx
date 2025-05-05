import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db';

// Define a type for the manual form data, omitting fields not manually entered
type ManualRecipeFormData = Pick<
  Recipe, 
  'title' | 'description' | 'time' | 'servings' | 'ingredients' | 'instructions' | 'tags' | 'notes'
>;

// Final data structure for submission (includes filtered lists)
export type FinalManualRecipeData = Omit<ManualRecipeFormData, 'ingredients' | 'instructions' | 'tags'> & {
  ingredients: string[];
  instructions: string[];
  tags: string[];
};

// Initial state for the manual form
const initialManualFormData: ManualRecipeFormData = {
  title: '',
  description: '',
  time: 0,
  servings: 0,
  ingredients: [''], // Start with one empty ingredient
  instructions: [''], // Start with one empty instruction
  tags: [''], // Start with one empty tag
  notes: '',
};

interface AddManuallyProps {
  onSubmit: (data: FinalManualRecipeData) => void;
  onValidityChange: (isValid: boolean) => void;
}

export default function AddManually({ onSubmit, onValidityChange }: AddManuallyProps) {
  const [manualFormData, setManualFormData] = useState<ManualRecipeFormData>(initialManualFormData);

  // Check form validity and notify parent
  useEffect(() => {
    const finalIngredients = manualFormData.ingredients.filter(item => item.trim() !== '');
    const finalInstructions = manualFormData.instructions.filter(item => item.trim() !== '');
    const finalTags = manualFormData.tags.filter(item => item.trim() !== '');
    const isValid = !!(manualFormData.title.trim() && manualFormData.time > 0 && manualFormData.servings > 0 && finalIngredients.length > 0 && finalInstructions.length > 0);
    onValidityChange(isValid);
  }, [manualFormData, onValidityChange]);

  // Helper to update manual form state for simple fields
  const handleManualFormChange = (field: keyof Omit<ManualRecipeFormData, 'ingredients' | 'instructions' | 'tags'>, value: string | number) => {
    setManualFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- Handlers for Dynamic Lists ---

  const handleListItemChange = (
    listType: 'ingredients' | 'instructions' | 'tags', 
    index: number, 
    value: string
  ) => {
    setManualFormData(prev => {
      const newList = [...prev[listType]];
      newList[index] = value;
      return { ...prev, [listType]: newList };
    });
  };

  const addListItem = (listType: 'ingredients' | 'instructions' | 'tags') => {
    setManualFormData(prev => ({
      ...prev,
      [listType]: [...prev[listType], ''] // Add empty string for new item
    }));
  };

  const removeListItem = (listType: 'ingredients' | 'instructions' | 'tags', index: number) => {
    setManualFormData(prev => {
      // Prevent removing the last item if it's the only one
      if (prev[listType].length <= 1) return prev; 
      const newList = [...prev[listType]];
      newList.splice(index, 1);
      return { ...prev, [listType]: newList };
    });
  };

  return (
    <View style={styles.manualFormContainer}>
      {/* Title */}
      <Text style={styles.formLabel}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Recipe Title"
        value={manualFormData.title}
        onChangeText={(text) => handleManualFormChange('title', text)}
        placeholderTextColor="#79320680"
      />

      {/* Description */}
      <Text style={styles.formLabel}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Brief description..."
        value={manualFormData.description}
        onChangeText={(text) => handleManualFormChange('description', text)}
        placeholderTextColor="#79320680"
        multiline
      />

      {/* Time & Servings */}
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.formLabel}>Time (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 30"
            value={manualFormData.time ? String(manualFormData.time) : ''}
            onChangeText={(text) => handleManualFormChange('time', Number(text) || 0)}
            placeholderTextColor="#79320680"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.column}>
          <Text style={styles.formLabel}>Servings</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 4"
            value={manualFormData.servings ? String(manualFormData.servings) : ''}
            onChangeText={(text) => handleManualFormChange('servings', Number(text) || 0)}
            placeholderTextColor="#79320680"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Ingredients */}
      <Text style={styles.formLabel}>Ingredients</Text>
      {manualFormData.ingredients.map((ingredient, index) => (
        <View key={index} style={styles.listItemContainer}>
          <TextInput
            style={[styles.input, styles.listItemInput]}
            placeholder={`Ingredient ${index + 1}`}
            value={ingredient}
            onChangeText={(text) => handleListItemChange('ingredients', index, text)}
            placeholderTextColor="#79320680"
          />
           {/* Show remove button only if there's more than one item */}
          {manualFormData.ingredients.length > 1 && (
            <TouchableOpacity onPress={() => removeListItem('ingredients', index)} style={styles.removeButton}>
              <MaterialIcons name="close" size={20} color="#793206" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => addListItem('ingredients')}>
         <MaterialIcons name="add" size={20} color="#793206" />
         <Text style={styles.addButtonText}>Add Ingredient</Text>
      </TouchableOpacity>

      {/* Instructions */}
      <Text style={styles.formLabel}>Instructions</Text>
      {manualFormData.instructions.map((instruction, index) => (
        <View key={index} style={styles.listItemContainer}>
          <TextInput
            style={[styles.input, styles.listItemInput, styles.textAreaShort]} // Apply text area style for multiline
            placeholder={`Step ${index + 1}`}
            value={instruction}
            onChangeText={(text) => handleListItemChange('instructions', index, text)}
            placeholderTextColor="#79320680"
            multiline // Allow multiline instructions per step
          />
          {/* Show remove button only if there's more than one item */}
          {manualFormData.instructions.length > 1 && (
           <TouchableOpacity onPress={() => removeListItem('instructions', index)} style={styles.removeButton}>
             <MaterialIcons name="close" size={20} color="#793206" />
           </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => addListItem('instructions')}>
         <MaterialIcons name="add" size={20} color="#793206" />
         <Text style={styles.addButtonText}>Add Instruction</Text>
      </TouchableOpacity>
       
      {/* Tags */}
      <Text style={styles.formLabel}>Tags</Text>
      {manualFormData.tags.map((tag, index) => (
        <View key={index} style={styles.listItemContainer}>
          <TextInput
            style={[styles.input, styles.listItemInput]}
            placeholder={`Tag ${index + 1}`}
            value={tag}
            onChangeText={(text) => handleListItemChange('tags', index, text)}
            placeholderTextColor="#79320680"
          />
          {/* Show remove button only if there's more than one item */}
          {manualFormData.tags.length > 1 && (
            <TouchableOpacity onPress={() => removeListItem('tags', index)} style={styles.removeButton}>
              <MaterialIcons name="close" size={20} color="#793206" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => addListItem('tags')}>
         <MaterialIcons name="add" size={20} color="#793206" />
         <Text style={styles.addButtonText}>Add Tag</Text>
      </TouchableOpacity>

      {/* Notes */}
      <Text style={styles.formLabel}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Optional notes..."
        value={manualFormData.notes}
        onChangeText={(text) => handleManualFormChange('notes', text)}
        placeholderTextColor="#79320680"
        multiline
      />
    </View>
  );
}

// Styles moved from the parent component
const styles = StyleSheet.create({
  manualFormContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    color: '#793206',
    borderWidth: 1,
    borderColor: '#79320633',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top', // Align text to the top for multiline
  },
  textAreaShort: {
      minHeight: 50, // Adjust as needed
      textAlignVertical: 'top',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16, // Add gap between columns
  },
  column: {
    flex: 1,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically
    marginBottom: 8,
  },
  listItemInput: {
    flex: 1, // Take up available space
    marginRight: 8, // Space before remove button
  },
  removeButton: {
    padding: 4, // Make touch target slightly larger
    backgroundColor: '#79320633', // Subtle background
    borderRadius: 15, // Circular touch area
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content
    gap: 8, // Space between icon and text
    marginTop: 8, // Space above button
    paddingVertical: 10, // Vertical padding
    paddingHorizontal: 16, // Horizontal padding
    borderRadius: 8,
    width: '100%', // Make button full width within its container
    backgroundColor: '#79320633', // Use low opacity brown
    alignSelf: 'flex-start', 
  },
  addButtonText: {
      color: '#793206',
      fontWeight: '600',
      fontSize: 16,
  },
});
