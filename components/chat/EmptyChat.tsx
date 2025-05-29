import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyChatProps {
  recipeName: string;
}

export const EmptyChat: React.FC<EmptyChatProps> = ({ recipeName }) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('@/assets/images/jacquin-full.png')} style={styles.image} />
      </View>
      
      <Text style={styles.title}>Hey there! I'm Jacquin 👨🏽‍🍳🍪</Text>
      <Text style={styles.subtitle}>
        Ask me anything about {recipeName}! 
      </Text>
      <Text style={styles.subtitle}>
        Get cooking tips, ingredient substitutions, or help with any step of the recipe.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 24,
  },
  imageContainer: {
    position: 'relative',
    marginVertical: 24,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  foodIcon: {
    position: 'absolute',
    bottom: -8,
    right: -16,
    opacity: 0.9,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#793206',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 8,
  },
  suggestionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#793206',
    marginBottom: 16,
  },
  suggestionBubble: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#79320633',
    maxWidth: '90%',
  },
  suggestionText: {
    fontSize: 15,
    color: '#793206',
    opacity: 0.9,
  },
});
