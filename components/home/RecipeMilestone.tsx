import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipes } from '@/hooks/recipes';

const MILESTONE_TARGET = 3;

export const RecipeMilestone = () => {
  const { profile } = useAuth();
  const { data: recipes = [] } = useRecipes(profile?.id);

  const recipeCount = recipes.length;
  const progress = Math.min(recipeCount / MILESTONE_TARGET, 1);
  const isCompleted = recipeCount >= MILESTONE_TARGET;

  // Don't show milestone if completed
  if (isCompleted) return null;

  const remainingRecipes = MILESTONE_TARGET - recipeCount;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/new-recipe')}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="local-dining" size={20} color="#EDE4D2" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Let's get you started!</Text>
          <Text style={styles.subtitle}>
            Add {remainingRecipes} more {remainingRecipes === 1 ? 'recipe' : 'recipes'} to your
            cookbook
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#793206" />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {recipeCount}/{MILESTONE_TARGET}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#793206',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#793206',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#79320680',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#79320633',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#793206',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#793206',
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center',
  },
});
