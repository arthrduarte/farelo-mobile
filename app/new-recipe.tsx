import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useState, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db'; // Import Recipe type
// import * as ImagePicker from 'expo-image-picker';

// Import components
import ImportLink from '@/components/new/ImportLink';
import AddManually, { FinalManualRecipeData } from '@/components/new/AddManually';
import SelectGallery from '@/components/new/SelectGallery';
import TakePicture from '@/components/new/TakePicture';

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
  const [isFormValid, setIsFormValid] = useState(false); // New state for form validity
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

  // Handler for form validity changes from AddManually component
  const handleFormValidityChange = (isValid: boolean) => {
    setIsFormValid(isValid);
  };

  // Handler for AddManually form submission
  const handleManualSubmit = (data: FinalManualRecipeData) => {
    console.log('Manual recipe data:', data);
    // TODO: Add actual submission logic here (e.g., API call)
    // router.push('/somewhere-after-success');
  };

  // --- Submission Handler ---
  const handleUpload = () => {
    if (importMethod === 'link' && !recipeUrl.trim()) {
      return;
    }
    
    console.log('Upload:', { method: importMethod, url: recipeUrl });
    // TODO: Add logic for image/camera uploads
  };

  // Wrapper function that handles the TouchableOpacity onPress event
  const handleButtonPress = () => {
    if (importMethod === 'manual') {
      // For manual mode, we need to get data from the form component
      // This will be handled via the AddManually component's onSubmit prop
      console.log('Manual form button pressed');
    } else {
      handleUpload();
    }
  };

  const renderContent = () => {
    switch (importMethod) {
      case 'image':
        return <SelectGallery onPress={handleUpload} />;
      case 'camera':
        return <TakePicture onPress={handleUpload} />;
      case 'manual':
        return (
          <AddManually 
            onSubmit={handleManualSubmit}
            onValidityChange={handleFormValidityChange}
          />
        );
      default: // 'link'
        return <ImportLink recipeUrl={recipeUrl} setRecipeUrl={setRecipeUrl} />;
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
            (importMethod === 'manual' && !isFormValid) && styles.uploadButtonDisabled 
          ]} 
          onPress={handleButtonPress}
          disabled={
            (importMethod === 'link' && !recipeUrl.trim()) ||
            (importMethod === 'manual' && !isFormValid)
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