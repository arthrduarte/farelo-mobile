import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Recipe } from '@/types/db';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface RemixModalProps {
  visible: boolean;
  onClose: () => void;
  recipe: Recipe;
}

export default function RemixModal({ visible, onClose, recipe }: RemixModalProps) {
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemix = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('https://usefarelo.com/api/recipes/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header here when implemented
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          prompt: instructions.trim(),
          profile_id: recipe.profile_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to remix recipe');
      }

      const newRecipe = await response.json(); // returns only the recipe id

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', newRecipe.recipeId)
        .single();
      
      if (error) {
        throw error;
      }

      onClose();
      setInstructions('');
      
      // Navigate to the new recipe's start screen
      router.push({
        pathname: '/recipe/[recipeId]/details',
        params: { recipeId: data.id }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Remix Recipe</Text>
          <Text style={styles.modalSubtitle}>
            How would you like to change "{recipe.title}"?
          </Text>

          <TextInput
            style={styles.input}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="E.g., Make it spicier, Make it vegetarian, etc."
            multiline
            numberOfLines={3}
            placeholderTextColor="#79320680"
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.modalButton, 
                styles.remixButton,
                !instructions.trim() && styles.disabledButton
              ]}
              onPress={handleRemix}
              disabled={isLoading || !instructions.trim()}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.remixButtonText}>Remix</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#EDE4D2',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#793206',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#793206',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  cancelButton: {
    backgroundColor: '#EDE4D2',
  },
  remixButton: {
    backgroundColor: '#793206',
  },
  disabledButton: {
    backgroundColor: '#79320680',
  },
  cancelButtonText: {
    color: '#793206',
    fontSize: 16,
    fontWeight: '600',
  },
  remixButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 16,
  },
}); 