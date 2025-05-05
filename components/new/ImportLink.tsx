import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface ImportLinkProps {
  recipeUrl: string;
  setRecipeUrl: (url: string) => void;
}

export default function ImportLink({ recipeUrl, setRecipeUrl }: ImportLinkProps) {
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
});
