import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';

export default function NewRecipeModal() {
  const isPresented = router.canGoBack();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>Add New Recipe</Text>
        
        {/* Form content will go here */}
        <Text>Recipe form coming soon...</Text>

        {isPresented && (
          <Link href=".." asChild>
            <Pressable style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Link>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    // width: '90%',
    backgroundColor: '#EDE4D2', // BEIGE
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#793206', // BROWN
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#793206', // BROWN
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#EDE4D2', // BEIGE
    fontSize: 16,
    fontWeight: '600',
  },
}); 