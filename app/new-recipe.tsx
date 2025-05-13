import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useState, useRef, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/db'; // Import Recipe type
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import ImportLink from '@/components/new/ImportLink';
import AddManually, { FinalManualRecipeData } from '@/components/new/AddManually';
import SelectGallery from '@/components/new/SelectGallery';
import Drawer from '@/components/ui/Drawer'; // Import the new Drawer component

type ImportMethod = 'link' | 'image' | 'manual';

// Define a type for the manual form data, omitting fields not manually entered
type ManualRecipeFormData = Pick<
  Recipe, 
  'title' | 'description' | 'time' | 'servings' | 'ingredients' | 'instructions' | 'tags' | 'notes'
>;

export default function NewRecipeModal() {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const params = useLocalSearchParams<{ importMethod?: ImportMethod }>();
  const [importMethod, setImportMethod] = useState<ImportMethod>(params.importMethod || 'manual');
  const drawerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (params.importMethod && params.importMethod !== importMethod) {
      setImportMethod(params.importMethod);
    }
  }, [params.importMethod]);

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

  // Define drawer options
  const drawerOptions = [
    {
      icon: 'link' as keyof typeof MaterialIcons.glyphMap,
      text: 'Import Link',
      onPress: () => handleDrawerOption('link'),
    },
    {
      icon: 'photo-library' as keyof typeof MaterialIcons.glyphMap,
      text: 'Select from Gallery',
      onPress: () => handleDrawerOption('image'),
    },
    {
      icon: 'edit-note' as keyof typeof MaterialIcons.glyphMap,
      text: 'Add Manually',
      onPress: () => handleDrawerOption('manual'),
    },
  ];


  const renderContent = () => {
    switch (importMethod) {
      case 'image':
        return <SelectGallery />;
      case 'link':
        return <ImportLink recipeUrl={recipeUrl} setRecipeUrl={setRecipeUrl} />;
      default: // manual
        return <AddManually />
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Add New Recipe" showBackButton={true}
        rightItem={
          <TouchableOpacity onPress={toggleDrawer}>
            <MaterialIcons name="more-vert" size={24} color="#793206" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>
        {renderContent()}
      </ScrollView>

      {/* Use the new Drawer component */}
      <Drawer 
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        drawerAnimation={drawerAnimation}
        options={drawerOptions}
        title="Import Options"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
}); 