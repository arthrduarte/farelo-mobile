import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Recipe } from '@/types/db';
import { useState, useEffect } from 'react';
import RecipeCard from '@/components/RecipeCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';

export default function ProfileScreen() {
  const [recipes, setRecipes] = useState<Partial<Recipe>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <Text>Profile</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});