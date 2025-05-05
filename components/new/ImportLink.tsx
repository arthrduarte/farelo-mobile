import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECIPE_KEYS } from '@/hooks/useRecipes';
import { router } from 'expo-router';
import { Recipe } from '@/types/db';

interface ImportLinkProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
}

const UNSUPPORTED_DOMAINS = [
  'tiktok.com',
  'instagram.com',
  'youtube.com',
  'x.com',
  'facebook.com'
];

export default function ImportLink({ recipeUrl, setRecipeUrl }: ImportLinkProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);

  const importRecipeMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!profile) throw new Error('User not authenticated');

      // Check for unsupported domains
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      if (UNSUPPORTED_DOMAINS.some(d => domain.includes(d))) {
        throw new Error(`We currently don't support importing recipes from ${domain}. Try taking a screenshot of the caption and uploading it here instead!`);
      }

      const response = await fetch('https://usefarelo.com/api/recipes/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers here if needed
        },
        body: JSON.stringify({
          url,
          profile_id: profile.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to import recipe');
      }

      return await response.json() as Recipe;
    },
    onSuccess: (newRecipe) => {
      // Update the recipes list cache
      queryClient.setQueryData<Recipe[]>(
        RECIPE_KEYS.list(newRecipe.profile_id),
        (oldRecipes) => {
          if (!oldRecipes) return [newRecipe];
          return [newRecipe, ...oldRecipes];
        }
      );

      // Navigate to the recipe details
      router.replace({
        pathname: '/recipe/[recipeId]/details',
        params: { recipeId: newRecipe.id }
      });
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    }
  });

  const handleUrlSubmit = async () => {
    console.log('handleUrlSubmit', recipeUrl);
    if (!recipeUrl.trim()) {
      Alert.alert('Error', 'Please enter a recipe URL');
      return;
    }

    try {
      setIsImporting(true);
      await importRecipeMutation.mutateAsync(recipeUrl);
    } catch (error) {
      // Error is handled by the mutation's onError
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, isImporting && styles.inputDisabled]}
        placeholder="Paste recipe URL here..."
        value={recipeUrl}
        onChangeText={setRecipeUrl}
        onSubmitEditing={handleUrlSubmit}
        placeholderTextColor="#79320680"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        editable={!isImporting}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleUrlSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  inputDisabled: {
    opacity: 0.7,
  },
  submitButton: {
    backgroundColor: '#793206',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#EDE4D2',
    fontSize: 16, 
    fontWeight: '600',
  },
});

