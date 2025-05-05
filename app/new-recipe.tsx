import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useState, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db'; // Import Recipe type
// import * as ImagePicker from 'expo-image-picker';

type ImportMethod = 'link' | 'image' | 'camera' | 'manual';

// Define a type for the manual form data, omitting fields not manually entered
type ManualRecipeFormData = Pick<
  Recipe, 
  'title' | 'description' | 'time' | 'servings' | 'ingredients' | 'instructions' | 'tags' | 'notes'
>;

// Initial state for the manual form
const initialManualFormData: ManualRecipeFormData = {
  title: '',
  description: '',
  time: 0,
  servings: 0,
  ingredients: [''], // Start with one empty ingredient
  instructions: [''], // Start with one empty instruction
  tags: [], 
  notes: '',
};

export default function NewRecipeModal() {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [importMethod, setImportMethod] = useState<ImportMethod>('link');
  const [manualFormData, setManualFormData] = useState<ManualRecipeFormData>(initialManualFormData); // State for manual form
  const drawerAnimation = useRef(new Animated.Value(0)).current;

  const handleBack = () => {
    router.back();
  };

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? 0 : 1;
    
    Animated.spring(drawerAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();

    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleDrawerOption = (method: ImportMethod) => {
    setImportMethod(method);
    toggleDrawer();
  };

  // Helper to update manual form state for simple fields
  const handleManualFormChange = (field: keyof Omit<ManualRecipeFormData, 'ingredients' | 'instructions' | 'tags'>, value: string | number) => {
    setManualFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- Handlers for Dynamic Lists ---

  const handleListItemChange = (
    listType: 'ingredients' | 'instructions', 
    index: number, 
    value: string
  ) => {
    setManualFormData(prev => {
      const newList = [...prev[listType]];
      newList[index] = value;
      return { ...prev, [listType]: newList };
    });
  };

  const addListItem = (listType: 'ingredients' | 'instructions') => {
    setManualFormData(prev => ({
      ...prev,
      [listType]: [...prev[listType], ''] // Add empty string for new item
    }));
  };

  const removeListItem = (listType: 'ingredients' | 'instructions', index: number) => {
    setManualFormData(prev => {
      // Prevent removing the last item if it's the only one
      if (prev[listType].length <= 1) return prev; 
      const newList = [...prev[listType]];
      newList.splice(index, 1);
      return { ...prev, [listType]: newList };
    });
  };

  // --- Handler for Tags ---
  const handleTagsChange = (text: string) => {
    // Split by comma, trim whitespace around each tag, filter empty strings
    const tagsArray = text.split(',')
                          .map(tag => tag.trim()) // Trim whitespace around tags
                          .filter(tag => tag !== ''); // Remove empty tags resulting from multiple commas etc.
    setManualFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  // --- Submission Handler ---

  const handleUpload = () => {
    if (importMethod === 'link' && !recipeUrl.trim()) {
      return;
    }
    if (importMethod === 'manual') {
      // Filter out empty ingredients/instructions before validation/submission
      const finalIngredients = manualFormData.ingredients.filter(item => item.trim() !== '');
      const finalInstructions = manualFormData.instructions.filter(item => item.trim() !== '');

      // Basic validation (can be expanded)
      if (!manualFormData.title.trim() || !manualFormData.time || !manualFormData.servings || !finalIngredients.length || !finalInstructions.length) {
         console.warn("Please fill all required fields and add at least one ingredient and instruction.");
         return; 
      }
      
      const finalFormData = {
        ...manualFormData,
        ingredients: finalIngredients,
        instructions: finalInstructions,
      };

      console.log('Upload Manual Recipe:', finalFormData);
      // TODO: Add actual submission logic here (e.g., API call)
      // router.push('/somewhere-after-success'); 
      return;
    }
    
    console.log('Upload:', { method: importMethod, url: recipeUrl });
    // TODO: Add logic for image/camera uploads
  };
  
  // Check if manual form is valid for enabling button
  const isManualFormValid = () => {
      const finalIngredients = manualFormData.ingredients.filter(item => item.trim() !== '');
      const finalInstructions = manualFormData.instructions.filter(item => item.trim() !== '');
      return !!(manualFormData.title.trim() && manualFormData.time > 0 && manualFormData.servings > 0 && finalIngredients.length > 0 && finalInstructions.length > 0);
  }

  const renderContent = () => {
    switch (importMethod) {
      case 'image':
        return (
          <TouchableOpacity 
            style={styles.placeholderContainer} 
            onPress={handleUpload}
            activeOpacity={0.7}
          >
            <MaterialIcons name="photo-library" size={48} color="#79320680" />
            <Text style={styles.placeholderText}>Tap to select an image</Text>
          </TouchableOpacity>
        );
      case 'camera':
        return (
          <TouchableOpacity 
            style={styles.placeholderContainer} 
            onPress={handleUpload}
            activeOpacity={0.7}
          >
            <MaterialIcons name="camera-alt" size={48} color="#79320680" />
            <Text style={styles.placeholderText}>Tap to take a picture</Text>
          </TouchableOpacity>
        );
      case 'manual':
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
            <Text style={styles.formLabel}>Tags (comma-separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., quick, easy dinner, vegan" // Updated placeholder
              value={manualFormData.tags.join(', ')} // Join array for display
              onChangeText={handleTagsChange} // Use updated handler
              placeholderTextColor="#79320680"
            />

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
      default:
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Paste recipe URL here..."
              value={recipeUrl}
              onChangeText={setRecipeUrl}
              placeholderTextColor="#79320680"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialIcons name="arrow-back" size={24} color="#793206" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add New Recipe</Text>
          <TouchableOpacity onPress={toggleDrawer}>
            <MaterialIcons name="more-vert" size={24} color="#793206" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Content */}
        {renderContent()}

        {/* Upload Button */}
        <TouchableOpacity 
          style={[
            styles.uploadButton, 
            (importMethod === 'link' && !recipeUrl.trim()) && styles.uploadButtonDisabled,
            // Disable button if manual form is invalid
            (importMethod === 'manual' && !isManualFormValid()) && styles.uploadButtonDisabled 
          ]} 
          onPress={handleUpload}
          disabled={
            (importMethod === 'link' && !recipeUrl.trim()) ||
            (importMethod === 'manual' && !isManualFormValid())
          }
        >
          <Text style={styles.uploadButtonText}>
            {importMethod === 'link' ? 'Import Recipe' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Drawer */}
      {isDrawerOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={toggleDrawer}
        />
      )}
      
      <Animated.ScrollView 
        style={[
          styles.drawer,
          {
            transform: [{
              translateY: drawerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0]
              })
            }]
          }
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Import Options</Text>
          <TouchableOpacity onPress={toggleDrawer}>
            <MaterialIcons name="close" size={24} color="#793206" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.drawerOption} 
          onPress={() => handleDrawerOption('link')}
        >
          <MaterialIcons name="link" size={24} color="#793206" />
          <Text style={styles.drawerOptionText}>Import Link</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.drawerOption} 
          onPress={() => handleDrawerOption('image')}
        >
          <MaterialIcons name="photo-library" size={24} color="#793206" />
          <Text style={styles.drawerOptionText}>Select from Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.drawerOption} 
          onPress={() => handleDrawerOption('camera')}
        >
          <MaterialIcons name="camera-alt" size={24} color="#793206" />
          <Text style={styles.drawerOptionText}>Take a Picture</Text>
        </TouchableOpacity>

        {/* Add Manual Option */}
        <TouchableOpacity 
          style={[styles.drawerOption, { marginBottom: 32 }]} 
          onPress={() => handleDrawerOption('manual')}
        >
          <MaterialIcons name="edit-note" size={24} color="#793206" />
          <Text style={styles.drawerOptionText}>Add Manually</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </ThemedView>
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#793206',
  },
  inputContainer: {
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
  // Style for instruction text inputs
  textAreaShort: {
      minHeight: 50, // Adjust as needed
      textAlignVertical: 'top',
  },
  manualFormContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
  // Styles for dynamic list items
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
    width: '100%',
    backgroundColor: '#79320633', // Use low opacity brown
    alignSelf: 'flex-start', // Align button to the left
  },
  addButtonText: {
      color: '#793206',
      fontWeight: '600',
      fontSize: 16,
  },
  placeholderContainer: {
    backgroundColor: '#79320633',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#793206',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#793206',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#79320680',
  },
  uploadButtonText: {
    color: '#EDE4D2',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EDE4D2',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    height: '33%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
  },
  drawerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    backgroundColor: '#79320633',
    borderRadius: 8,
    marginBottom: 12,
  },
  drawerOptionText: {
    fontSize: 16,
    color: '#793206',
    fontWeight: '500',
  },
}); 