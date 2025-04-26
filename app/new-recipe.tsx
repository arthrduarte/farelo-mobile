import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useState, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';

type ImportMethod = 'link' | 'image' | 'camera';

export default function NewRecipeModal() {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [importMethod, setImportMethod] = useState<ImportMethod>('link');
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

  const handleUpload = () => {
    if (importMethod === 'link' && !recipeUrl.trim()) {
      return;
    }
    console.log('Upload:', { method: importMethod, url: recipeUrl });
  };

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
          style={[styles.uploadButton, !recipeUrl.trim() && importMethod === 'link' && styles.uploadButtonDisabled]} 
          onPress={handleUpload}
          disabled={importMethod === 'link' && !recipeUrl.trim()}
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
      
      <Animated.View 
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
      </Animated.View>
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