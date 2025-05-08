import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RECIPE_KEYS } from '@/hooks/useRecipes';
import { router } from 'expo-router';
import { Recipe } from '@/types/db';
import { supabase } from '@/lib/supabase';

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
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Reading recipe...",
    "Formatting recipe...",
    "Creating image..."
  ];

  // Effect to handle loading step changes
  useEffect(() => {
    if (!isImporting) {
      setLoadingStep(0);
      return;
    }

    const timers = [
      setTimeout(() => setLoadingStep(1), 3000),
      setTimeout(() => setLoadingStep(2), 6000)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isImporting]);

  const importRecipeMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!profile) throw new Error('User not authenticated');

      console.log('Starting recipe import for URL:', url);

      // Check for unsupported domains
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      if (UNSUPPORTED_DOMAINS.some(d => domain.includes(d))) {
        throw new Error(`We currently don't support importing recipes from ${domain}. Try taking a screenshot of the caption and uploading it here instead!`);
      }

      console.log('Making API request to import recipe');
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
        console.error('API error response:', error);
        throw new Error(error.error?.message || 'Failed to import recipe');
      }

      const { recipeId, success } = await response.json();
      console.log('Successfully imported recipe:', { recipeId, success });

      if (!success || !recipeId) {
        throw new Error('Failed to import recipe: Invalid response from server');
      }

      // Fetch the full recipe data from Supabase
      console.log('Fetching full recipe data from Supabase');
      const { data: recipe, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (fetchError || !recipe) {
        console.error('Error fetching recipe:', fetchError);
        throw new Error('Failed to fetch imported recipe details');
      }

      console.log('Full recipe data fetched:', recipe);
      return recipe as Recipe;
    },
    onSuccess: (newRecipe) => {
      console.log('Mutation succeeded, updating cache with recipe:', newRecipe);
      // Update the recipes list cache
      queryClient.setQueryData<Recipe[]>(
        RECIPE_KEYS.list(newRecipe.profile_id),
        (oldRecipes) => {
          if (!oldRecipes) return [newRecipe];
          return [newRecipe, ...oldRecipes];
        }
      );

      // Navigate to the recipe details
      console.log('Navigating to recipe details with ID:', newRecipe.id);
      router.replace({
        pathname: '/recipe/[recipeId]/details',
        params: { recipeId: newRecipe.id }
      });
    },
    onError: (error: Error) => {
      console.error('Import mutation error:', error);
      Alert.alert('Error', error.message);
    }
  });

  const handleUrlSubmit = async () => {
    console.log('handleUrlSubmit called with URL:', recipeUrl);
    if (!recipeUrl.trim()) {
      Alert.alert('Error', 'Please enter a recipe URL');
      return;
    }

    try {
      setIsImporting(true);
      console.log('Starting import mutation');
      await importRecipeMutation.mutateAsync(recipeUrl);
    } catch (error) {
      // Error is handled by the mutation's onError
      console.error('Error in handleUrlSubmit:', error);
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
      <TouchableOpacity 
        style={[styles.submitButton, isImporting && styles.submitButtonDisabled]} 
        onPress={handleUrlSubmit}
        disabled={isImporting}
      >
        {isImporting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#EDE4D2" />
            <Text style={styles.submitButtonText}>
              {loadingSteps[loadingStep]}
            </Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.8,
  },
});

